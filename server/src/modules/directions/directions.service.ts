import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'

@Injectable()
export class DirectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Временно отключено - модель Direction отсутствует в схеме Prisma
    // return this.prisma.direction.findMany({
    //   orderBy: { name: 'asc' },
    // })
    return []
  }

  async findOne(id: string) {
    // Временно отключено - модель Direction отсутствует в схеме Prisma
    // return this.prisma.direction.findUnique({
    //   where: { id },
    // })
    return null
  }

  async findByExamType(examType: 'OGE' | 'EGE') {
    // Временно отключено - модель Direction отсутствует в схеме Prisma
    // return this.prisma.direction.findMany({
    //   where: { examType },
    //   orderBy: { name: 'asc' },
    // })
    return []
  }
}


