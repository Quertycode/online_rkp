import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding directions...')
  
  // Временно отключено - модель Direction отсутствует в схеме Prisma
  // const directions = [
  //   { name: 'Математика (профильная)', examType: ExamType.EGE },
  //   { name: 'Математика (базовая)', examType: ExamType.EGE },
  //   { name: 'Биология', examType: ExamType.EGE },
  //   { name: 'Русский язык', examType: ExamType.EGE },
  //   { name: 'История', examType: ExamType.EGE },
  //   { name: 'Английский язык', examType: ExamType.EGE },
  // ]

  // for (const direction of directions) {
  //   await prisma.direction.upsert({
  //     where: { name: direction.name },
  //     update: {},
  //     create: direction,
  //   })
  // }

  console.log('Seeding completed! (skipped - Direction model not in schema)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


