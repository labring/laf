export class ReleaseConfig {
  enableRelease: boolean
  enableNotification: boolean
  notificationProviders: string[]
  stages: {
    minutesElapsed: number
    notificationTemplate: string
  }[]
}
