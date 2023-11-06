import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
  Sse,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { FunctionService } from '../function/function.service'
import { ApiResponsePagination, ResponseUtil } from '../utils/response'
import { FunctionLog } from './entities/function-log'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { PassThrough } from 'nodemailer/lib/xoauth2'
import { Log } from '@kubernetes/client-node'
import { GetApplicationNamespace } from 'src/utils/getter'
import { RegionService } from 'src/region/region.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Observable } from 'rxjs'

@ApiBearerAuth('Authorization')
@Controller('apps/:appid/logs')
export class LogController {
  private readonly logger = new Logger(LogController.name)

  constructor(
    private readonly funcService: FunctionService,
    private readonly regionService: RegionService,
    private readonly clusterService: ClusterService,
  ) {}

  /**
   * Get function logs
   * @param appid
   * @param name
   * @returns
   */
  @ApiTags('Function')
  @ApiOperation({ summary: 'Get function logs' })
  @ApiResponsePagination(FunctionLog)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @ApiQuery({
    name: 'functionName',
    type: String,
    description: 'The function name. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'requestId',
    type: String,
    description: 'The request id. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: String,
    description: 'The page number, default is 1',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: String,
    description: 'The page size, default is 10',
    required: false,
  })
  @Get('functions')
  async getLogs(
    @Param('appid') appid: string,
    @Query('requestId') requestId?: string,
    @Query('functionName') functionName?: string,
    @Query('pageSize') pageSize?: number,
    @Query('page') page?: number,
  ) {
    page = page || 1
    pageSize = pageSize || 10

    const res = await this.funcService.getLogs(appid, {
      requestId,
      functionName,
      pageSize: pageSize,
      page,
    })

    return ResponseUtil.ok({
      list: res.data,
      total: res.total,
      page,
      limit: pageSize, // @deprecated use pageSize instead
      pageSize: pageSize,
    })
  }

  @ApiTags('Application')
  @ApiOperation({ summary: 'Get app pod logs' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Sse(':podName')
  async streamLogs(
    @Param('podName') podName: string,
    @Param('appid') appid: string,
  ) {
    const region = await this.regionService.findByAppId(appid)
    const namespaceOfApp = GetApplicationNamespace(region, appid)
    const kc = this.clusterService.loadKubeConfig(region)
    return new Observable<MessageEvent>((subscriber) => {
      const logStream = new PassThrough()
      const logs = new Log(kc)
      let k8sResponse

      const destroyStream = () => {
        if (k8sResponse) {
          k8sResponse?.destroy()
        }
        logStream?.removeAllListeners()
        logStream?.destroy()
      }

      logStream.on('data', (chunk) => {
        subscriber.next(chunk.toString() as MessageEvent)
      })

      logStream.on('error', (error) => {
        this.logger.error('stream error', error)
        subscriber.error(error)
        destroyStream()
      })

      logStream.on('end', () => {
        subscriber.complete()
        destroyStream()
      })
      ;(async () => {
        try {
          k8sResponse = await logs.log(
            namespaceOfApp,
            podName,
            appid,
            logStream,
            {
              follow: true,
              pretty: false,
              timestamps: false,
              tailLines: 1000,
            },
          )
        } catch (error) {
          this.logger.error('Failed to get logs', error)
          subscriber.error(error)
          destroyStream()
        }
      })()

      // Clean up when the client disconnects
      return () => destroyStream()
    })
  }
}
