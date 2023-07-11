import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum SettingKey {
  SiteTitle = 'site_title',
  SiteName = 'site_name',
  SiteDescription = 'site_description',
  SiteKeywords = 'site_keywords',
  SiteLogo = 'site_logo',
  SiteFavicon = 'site_favicon',
  SiteUrl = 'site_url',
  SiteFooter = 'site_footer',
  InvitationProfit = 'invitation_profit',

  AIPilotApiUrl = 'ai_pilot_api_url',
}

export class Setting {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  public: boolean

  @ApiProperty({ type: String, enum: SettingKey })
  key: SettingKey | string

  @ApiProperty()
  value: string

  @ApiPropertyOptional()
  desc?: string

  @ApiPropertyOptional()
  metadata?: any
}
