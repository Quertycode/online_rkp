import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id)
  }

  @Get('subject/:subject')
  findBySubject(@Param('subject') subject: string) {
    return this.coursesService.findBySubject(subject)
  }
}

