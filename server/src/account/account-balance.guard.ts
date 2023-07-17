import {
  ExecutionContext,
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { AccountService } from 'src/account/account.service'
import { IRequest } from 'src/utils/interface'

@Injectable()
export class AccountBalanceGuard implements CanActivate {
  constructor(private accountService: AccountService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const user = request.user

    // check account balance
    const account = await this.accountService.findOne(user._id)
    const balance = account?.balance || 0
    if (balance < 0) {
      // account balance is not enough
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST)
    }

    return true
  }
}
