import { Global, Module } from '@nestjs/common'
import { TeamController } from './team.controller'
import { TeamInviteController } from './team-invite/team-invite.controller'
import { TeamMemberController } from './team-member/team-member.controller'
import { TeamService } from './team.service'
import { TeamInviteService } from './team-invite/team-invite.service'
import { ApplicationService } from 'src/application/application.service'
import { TeamMemberService } from './team-member/team-member.service'

@Global()
@Module({
  controllers: [TeamController, TeamInviteController, TeamMemberController],
  providers: [
    TeamService,
    TeamInviteService,
    TeamMemberService,
    ApplicationService,
  ],
  exports: [TeamService, TeamMemberService],
})
export class TeamModule {}
