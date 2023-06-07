import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResponseArray, ResponseUtil } from './utils/response'
import { SystemDatabase } from './system-database'
import { Runtime } from './application/entities/runtime'

@ApiTags('Public')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)
  private readonly db = SystemDatabase.db

  /**
   * Get runtime list
   * @returns
   */
  @ApiOperation({ summary: 'Get application runtime list' })
  @ApiResponseArray(Runtime)
  @Get('runtimes')
  async getRuntimes() {
    const data = await this.db.collection<Runtime>('Runtime').find({}).toArray()
    return ResponseUtil.ok(data)
  }
}
