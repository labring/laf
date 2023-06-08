import { Module } from '@nestjs/common'
import { FunctionTemplateService } from './function-template.service'
import { FunctionTemplateController } from './function-template.controller'
// import { EnvironmentVariableService } from '../application/environment.service'
import { ApplicationModule } from 'src/application/application.module'
import { DatabaseModule } from 'src/database/database.module'
import { FunctionModule } from 'src/function/function.module'
import { DependencyModule } from '../dependency/dependency.module'

@Module({
  imports: [
    ApplicationModule,
    DatabaseModule,
    FunctionModule,
    DependencyModule,
  ],
  controllers: [FunctionTemplateController],
  // providers: [FunctionTemplateService, EnvironmentVariableService],
  providers: [FunctionTemplateService],
})
export class FunctionTemplateModule {}
