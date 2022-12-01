import { Global, Module } from '@nestjs/common'
import { ApplicationCoreService } from './application.cr.service'
import { BucketCoreService } from './bucket.cr.service'
import { BundleCoreService } from './bundle.cr.service'
import { DatabaseCoreService } from './database.cr.service'
import { FunctionCoreService } from './function.cr.service'
import { KubernetesService } from './kubernetes.service'
import { RuntimeCoreService } from './runtime.cr.service'

@Global()
@Module({
  providers: [
    KubernetesService,
    ApplicationCoreService,
    RuntimeCoreService,
    BundleCoreService,
    BucketCoreService,
    DatabaseCoreService,
    FunctionCoreService,
  ],
  exports: [
    KubernetesService,
    ApplicationCoreService,
    RuntimeCoreService,
    BundleCoreService,
    BucketCoreService,
    DatabaseCoreService,
    FunctionCoreService,
  ],
})
export class CoreModule {}
