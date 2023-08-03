import { Global, Module } from '@nestjs/common'
import { TeamController } from './team.controller'
import { TeamInviteController } from './team-invite/team-invite.controller'
import { TeamMemberController } from './team-member/team-member.controller'
import { TeamService } from './team.service'
import { TeamInviteService } from './team-invite/team-invite.service'
import { ApplicationService } from 'src/application/application.service'
import { TeamMemberService } from './team-member/team-member.service'
import { TeamApplicationService } from './team-application/team-application.service'
import { TeamApplicationController } from './team-application/team-application.controller'

@Global()
@Module({
  controllers: [
    TeamController,
    TeamInviteController,
    TeamMemberController,
    TeamApplicationController,
  ],
  providers: [
    TeamService,
    TeamInviteService,
    TeamMemberService,
    TeamApplicationService,
    ApplicationService,
  ],
  exports: [
    TeamService,
    TeamMemberService,
    TeamInviteService,
    TeamApplicationService,
  ],
})
export class TeamModule {}
