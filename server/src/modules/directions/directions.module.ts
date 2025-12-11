import { Module } from '@nestjs/common'
import { DirectionsController } from './directions.controller'
import { DirectionsService } from './directions.service'
import { PrismaService } from '../../common/services/prisma.service'

@Module({
  controllers: [DirectionsController],
  providers: [DirectionsService, PrismaService],
  exports: [DirectionsService],
})
export class DirectionsModule {}


