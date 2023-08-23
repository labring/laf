import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { MonitorController } from './monitor.controller'
import { MonitorService } from './monitor.service'
import { ApplicationModule } from 'src/application/application.module'

@Module({
  imports: [HttpModule, ApplicationModule],
  controllers: [MonitorController],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
