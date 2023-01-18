import { Global, Module } from '@nestjs/common'
import { RegionModule } from 'src/region/region.module'
import { GatewayCoreService } from './gateway.cr.service'

@Global()
@Module({
  imports: [RegionModule],
  providers: [GatewayCoreService],
  exports: [GatewayCoreService],
})
export class CoreModule {}
