import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common'
import http from 'http'
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
import { PodService } from 'src/application/pod.service'

@ApiBearerAuth('Authorization')
@Controller('apps/:appid/logs')
export class LogController {
  private readonly logger = new Logger(LogController.name)

  constructor(
    private readonly funcService: FunctionService,
    private readonly regionService: RegionService,
    private readonly clusterService: ClusterService,
    private readonly podService: PodService,
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
    @Query('containerName') containerName: string,
    @Param('appid') appid: string,
  ): Promise<Observable<MessageEvent>> {
    if (!containerName) {
      containerName = appid
    }

    const podStatus = await this.podService.getPodStatusListByAppid(appid)

    if (!podStatus.podStatus[0]) {
      return new Observable<MessageEvent>((subscriber) => {
        subscriber.error(new Error('pod not exist'))
      })
    }

    const podNameList = podStatus.podStatus.map((pod) => pod.name)

    const initContainerId = podStatus.podStatus.map(
      (pod) => pod.initContainerId,
    )

    if (containerName === 'init') {
      for (const containerId of initContainerId) {
        if (!containerId) {
          return new Observable<MessageEvent>((subscriber) => {
            subscriber.error(new Error('init container not exist'))
          })
        }
      }
    }

    if (podName !== 'all') {
      if (!podNameList.includes(podName)) {
        return new Observable<MessageEvent>((subscriber) => {
          subscriber.error(new Error('podName not exist'))
        })
      }
    }

    const region = await this.regionService.findByAppId(appid)
    const namespaceOfApp = GetApplicationNamespace(region, appid)
    const kc = this.clusterService.loadKubeConfig(region)

    return new Observable<MessageEvent>((subscriber) => {
      const combinedLogStream = new PassThrough()
      const logs = new Log(kc)

      const streamsEnded = new Set<string>()
      const k8sLogResponses: http.IncomingMessage[] = []
      const podLogStreams: PassThrough[] = []

      const destroyStream = () => {
        combinedLogStream.removeAllListeners()
        combinedLogStream.destroy()

        k8sLogResponses.forEach((response) => {
          response.removeAllListeners()
          response.destroy()
        })

        podLogStreams.forEach((stream) => {
          stream.removeAllListeners()
          stream.destroy()
        })
      }

      let idCounter = 1
      combinedLogStream.on('data', (chunk) => {
        const dataString = chunk.toString()
        const messageEvent: MessageEvent = {
          id: idCounter.toString(),
          data: dataString,
          type: 'log',
        }
        idCounter++
        subscriber.next(messageEvent)
      })

      combinedLogStream.on('error', (error) => {
        this.logger.error('Combined stream error', error)
        subscriber.error(error)
        destroyStream()
      })

      combinedLogStream.on('close', () => {
        subscriber.complete()
        destroyStream()
      })

      const fetchLog = async (podName: string) => {
        const podLogStream = new PassThrough()
        streamsEnded.add(podName)
        podLogStreams.push(podLogStream)

        try {
          const k8sResponse: http.IncomingMessage = await logs.log(
            namespaceOfApp,
            podName,
            containerName,
            podLogStream,
            {
              follow: true,
              previous: false,
              pretty: false,
              timestamps: false,
              tailLines: 1000,
            },
          )

          k8sLogResponses.push(k8sResponse)

          podLogStream.pipe(combinedLogStream, { end: false })

          podLogStream.on('error', (error) => {
            subscriber.error(error)
            this.logger.error(`podLogStream error for pod ${podName}`, error)
            destroyStream()
          })

          k8sResponse.on('close', () => {
            streamsEnded.delete(podName)
            if (streamsEnded.size === 0) {
              combinedLogStream.emit('close')
            }
          })

          podLogStream.on('close', () => {
            streamsEnded.delete(podName)
            if (streamsEnded.size === 0) {
              combinedLogStream.emit('close')
            }
          })
        } catch (error) {
          subscriber.error(error)
          this.logger.error(`Failed to get logs for pod ${podName}`, error)
          destroyStream()
        }
      }

      if (podName === 'all' && podNameList.length > 0) {
        podNameList.forEach((podName) => {
          fetchLog(podName)
        })
      } else {
        fetchLog(podName)
      }

      // Clean up when the client disconnects
      return () => {
        destroyStream()
      }
    })
  }
}
