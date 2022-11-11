import { ApplicationState } from '../entities/app.entity'

export class CreateAppDto {
  name: string
  state: ApplicationState
  region: string
  bundleName: string
  runtimeName: string

  validate(): string | null {
    if (!this.name) {
      return 'name is required'
    }
    if (!this.state) {
      return 'state is required'
    }
    if (!this.region) {
      return 'region is required'
    }
    if (!this.bundleName) {
      return 'bundleName is required'
    }

    return null
  }
}
