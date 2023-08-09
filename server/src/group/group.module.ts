import { Global, Module } from '@nestjs/common'
import { GroupController } from './group.controller'
import { GroupInviteController } from './group-invite/group-invite.controller'
import { GroupMemberController } from './group-member/group-member.controller'
import { GroupService } from './group.service'
import { GroupInviteService } from './group-invite/group-invite.service'
import { ApplicationService } from 'src/application/application.service'
import { GroupMemberService } from './group-member/group-member.service'
import { GroupApplicationService } from './group-application/group-application.service'

@Global()
@Module({
  controllers: [GroupController, GroupInviteController, GroupMemberController],
  providers: [
    GroupService,
    GroupInviteService,
    GroupMemberService,
    GroupApplicationService,
    ApplicationService,
  ],
  exports: [
    GroupService,
    GroupMemberService,
    GroupInviteService,
    GroupApplicationService,
  ],
})
export class GroupModule {}
