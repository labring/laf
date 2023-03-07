import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Logger, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { RegionService } from 'src/region/region.service'
import { DatabaseService } from '../database/database.service';
import * as SubmitCapture from './dto/submit-capture.dto';
import * as SubmitRestore from './dto/submit-restore.dto';
import { Publisher } from '@lafjs/mongo-async-rpc';
import { Capture, Restore } from '@lafjs/backup-interfaces';
import { ConflictException } from '@nestjs/common'
import assert from 'assert';




@ApiTags('Backup')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/backup')
export class BackupController {
	private readonly logger = new Logger(BackupController.name)

	public constructor(
		private readonly dbService: DatabaseService,
		private readonly regionService: RegionService,
		@Inject('publisher')
		private readonly publisher: Publisher,
	) { }

	@UseGuards(JwtAuthGuard, ApplicationAuthGuard)
	@HttpCode(201)
	@Post('capture')
	async postCapture(
		@Param('appid') appid: string,
		@Body() body: SubmitCapture.ReqBody,
	): Promise<SubmitCapture.ResBody> {
		const database = await this.dbService.findOne(appid);
		const region = await this.regionService.findByAppId(appid);
		const dbUri = this.dbService.getConnectionUri(region, database);

		try {
			const doc = await this.publisher.submit<Capture.Method, Capture.Params>(
				'capture',
				[{
					dbUri,
					collNames: body.collNames,
					appid,
				}],
				appid,
			);
			return doc;
		} catch (err) {
			if (err instanceof Publisher.Locked)
				throw new ConflictException();
			else
				throw err;
		}
	}

	@UseGuards(JwtAuthGuard, ApplicationAuthGuard)
	@HttpCode(201)
	@Post('restore')
	async postRestore(
		@Param('appid') appid: string,
		@Body() body: SubmitRestore.ReqBody,
	): Promise<SubmitRestore.ResBody> {
		const database = await this.dbService.findOne(appid);
		const region = await this.regionService.findByAppId(appid);
		const dbUri = this.dbService.getConnectionUri(region, database);

		assert(body.fileName.startsWith(appid), new UnauthorizedException());

		try {
			const doc = await this.publisher.submit<Restore.Method, Restore.Params>(
				'restore',
				[{
					fileName: body.fileName,
					dbUri,
					appid,
				}],
				appid,
			);
			return doc;
		} catch (err) {
			if (err instanceof Publisher.Locked)
				throw new ConflictException();
			else
				throw err;
		}
	}

	@UseGuards(JwtAuthGuard, ApplicationAuthGuard)
	@Get()
	async list(
		@Param('appid') appid: string,
	): Promise<(Capture.Document | Restore.Document)[]> {
		return await this.publisher.list({
			'request.params.0.appid': appid,
		}) as (Capture.Document | Restore.Document)[];
	}
}
