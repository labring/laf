import { Controller, Logger, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Policy, Proxy } from 'database-proxy/dist'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { IRequest } from 'src/utils/interface'
import { DatabaseService } from './database.service'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/databases')
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name)

  constructor(private readonly dbService: DatabaseService) {}

  /**
   * The database proxy for database management
   * @param appid
   * @param req
   */
  @ApiOperation({ summary: 'The database proxy for database management' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post('proxy')
  async proxy(@Param('appid') appid: string, @Req() req: IRequest) {
    const accessor = await this.dbService.getDatabaseAccessor(appid)

    // Don't need policy rules, open all collections' access permission for dbm use.
    // Just create a empty policy for proxy.
    const proxy = new Proxy(accessor, new Policy(accessor))

    // parse params
    const params = proxy.parseParams(req.body)

    // execute query
    try {
      const data = await proxy.execute(params)
      await accessor.close()

      // this response struct just for database proxy
      return {
        code: 0,
        data,
      }
    } catch (error) {
      await accessor.close()
      if (error.code === 121) {
        const errs = error.errInfo?.details?.schemaRulesNotSatisfied
        return {
          code: error.code,
          error: errs,
        }
      }
      return {
        code: error.code || 1,
        error: error,
      }
    }
  }
}
