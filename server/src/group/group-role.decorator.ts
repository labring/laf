import { SetMetadata } from '@nestjs/common'

export const GroupRoles = (...roles: string[]) =>
  SetMetadata('group-roles', roles)
