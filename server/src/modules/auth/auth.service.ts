import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../common/services/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(userData: {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
    birthdate?: string
    grade?: number
    directionIds?: string[]
  }) {
    const { password, directionIds, ...restData } = userData
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: {
        ...restData,
        password: hashedPassword,
        // Временно отключено - модель Direction отсутствует в схеме Prisma
        // directions: directionIds
        //   ? {
        //       create: directionIds.map((directionId) => ({
        //         direction: {
        //           connect: { id: directionId },
        //         },
        //       })),
        //     }
        //   : undefined,
      },
      include: {
        // Временно отключено - модель Direction отсутствует в схеме Prisma
        // directions: {
        //   include: {
        //     direction: true,
        //   },
        // },
      },
    })

    const { password: _, ...result } = user
    return result
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { password: _, ...result } = user
    return result
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }
}

