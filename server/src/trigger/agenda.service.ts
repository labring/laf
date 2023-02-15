import { Injectable, Logger } from '@nestjs/common'
import { Agenda, Job } from '@hokify/agenda'
import { ServerConfig } from 'src/constants'
import { CronTrigger } from '@prisma/client'
import { GetApplicationNamespaceById } from 'src/utils/getter'
import * as assert from 'node:assert'
import { APPLICATION_SECRET_KEY } from 'src/constants'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma.service'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class AgendaService {
  private readonly logger = new Logger(AgendaService.name)
  private agenda: Agenda
  public static JOB_NAME = 'TriggerCloudFunction'

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {
    this.agenda = new Agenda({
      db: {
        address: ServerConfig.DATABASE_URL,
        collection: 'CronJobs',
      },
      ensureIndex: true,
    })

    this.agenda.define(AgendaService.JOB_NAME, async (job, done) => {
      this.processor(job, done)
    })

    this.agenda.start().then(() => {
      this.logger.log('Agenda started')
    })
  }

  async createJob(trigger: CronTrigger) {
    const { cron } = trigger
    // const job = await this.agenda.every(cron, AgendaService.JOB_NAME, trigger)
    const job = this.agenda.create(AgendaService.JOB_NAME, trigger)
    job.repeatEvery(cron)
    await job.save()
    return job
  }

  async removeJob(trigger_id: string) {
    const job = await this.agenda.jobs({
      name: AgendaService.JOB_NAME,
      data: {
        id: trigger_id,
      },
    })
    if (job.length > 0) {
      await job[0].remove()
    }
  }

  async processor(job: Job<CronTrigger>, done: (error?: Error) => void) {
    const { appid, target } = job.attrs.data
    this.logger.debug(`Triggering ${target} by cron job ${job.attrs._id}`)

    // get runtime url
    const serviceName = appid
    const namespace = GetApplicationNamespaceById(appid)
    const appAddress = `${serviceName}.${namespace}:8000`
    const url = `http://${appAddress}/${target}`

    // generate trigger token
    const token = this.getTriggerToken(appid)
    const headers = { 'x-laf-trigger-token': `${token}` }
    this.httpService.axiosRef.post(url, {}, { headers }).catch(() => {
      // do nothing
    })
    done()
  }

  async getTriggerToken(appid: string) {
    const conf = await this.prisma.applicationConfiguration.findUnique({
      where: { appid },
    })

    // get secret from envs
    const secret = conf?.environments.find(
      (env) => env.name === APPLICATION_SECRET_KEY,
    )
    assert(secret?.value, 'application secret not found')

    // generate token
    const exp = Math.floor(Date.now() / 1000) + 60

    const token = this.jwtService.sign(
      { appid, type: 'trigger', exp },
      { secret: secret.value },
    )
    return token
  }
}
