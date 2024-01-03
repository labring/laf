import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DedicatedDatabaseService } from '../dedicated-database/dedicated-database.service'
import { ApplicationCreatingEvent } from 'src/application/events/application-creating.event'

@Injectable()
export class ApplicationListener {
  constructor(
    private readonly dedicatedDatabaseService: DedicatedDatabaseService,
  ) {}

  @OnEvent(ApplicationCreatingEvent.eventName, {
    promisify: true,
    async: true,
  })
  handleApplicationCreatedEvent(event: ApplicationCreatingEvent) {
    if (event.dto.dedicatedDatabase) {
      return this.dedicatedDatabaseService.create(event.appid, event.session)
    }
  }
}
