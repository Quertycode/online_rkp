import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        lessons: true,
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: true,
      },
    })
  }

  async findBySubject(subject: string) {
    return this.prisma.course.findFirst({
      where: { subject },
      include: {
        lessons: true,
      },
    })
  }
}

