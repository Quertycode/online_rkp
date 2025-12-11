import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        accessMath: true,
        accessRussian: true,
        createdAt: true,
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        stats: true,
        courses: {
          include: {
            course: true,
          },
        },
      },
    })
  }

  async update(id: string, updateData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    })
  }
}

