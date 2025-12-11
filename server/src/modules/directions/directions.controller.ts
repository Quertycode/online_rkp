import { Controller, Get, Param } from '@nestjs/common'
import { DirectionsService } from './directions.service'

@Controller('directions')
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @Get()
  findAll() {
    return this.directionsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.directionsService.findOne(id)
  }

  @Get('exam-type/:type')
  findByExamType(@Param('type') type: 'OGE' | 'EGE') {
    return this.directionsService.findByExamType(type)
  }
}


