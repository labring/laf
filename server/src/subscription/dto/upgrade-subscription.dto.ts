import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class UpgradeSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  targetBundleId: string

  @IsBoolean()
  @IsNotEmpty()
  restart: boolean
}
