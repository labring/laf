import { ClientSession } from 'mongodb'
import { CreateApplicationDto } from '../dto/create-application.dto'
import { Region } from 'src/region/entities/region'

export class ApplicationCreatingEvent {
  region: Region
  appid: string
  session: ClientSession
  dto: CreateApplicationDto

  constructor(partial: Partial<ApplicationCreatingEvent>) {
    Object.assign(this, partial)
  }

  static get eventName() {
    return 'application.creating'
  }
}
