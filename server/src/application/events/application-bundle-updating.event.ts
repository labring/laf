import { ClientSession } from 'mongodb'
import { Region } from 'src/region/entities/region'
import { UpdateApplicationBundleDto } from '../dto/update-application.dto'

export class ApplicationBundleUpdatingEvent {
  region: Region
  appid: string
  session: ClientSession
  dto: UpdateApplicationBundleDto

  constructor(partial: Partial<ApplicationBundleUpdatingEvent>) {
    Object.assign(this, partial)
  }

  static get eventName() {
    return 'application.bundle.updating'
  }
}
