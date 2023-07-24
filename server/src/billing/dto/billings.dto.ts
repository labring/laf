import { ApiProperty } from '@nestjs/swagger'

export class BillingsByDayDto {
  @ApiProperty({ type: String })
  totalAmount: number

  @ApiProperty({ type: Date })
  day: Date
}
