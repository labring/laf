import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { GroupRole } from '../entities/group-member'
import { ObjectId } from 'mongodb'

export class GenerateGroupInviteCodeDto {
  @ApiProperty({ enum: GroupRole })
  @IsEnum(GroupRole)
  @IsNotEmpty()
  role: GroupRole

  createdBy: ObjectId
}
