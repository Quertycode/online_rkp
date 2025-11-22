import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
// import { AuthModule } from './modules/auth/auth.module'
// import { UsersModule } from './modules/users/users.module'
// import { CoursesModule } from './modules/courses/courses.module'
// import { DirectionsModule } from './modules/directions/directions.module'
import { TasksModule } from './modules/tasks/tasks.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Временно отключены из-за ошибок компиляции
    // AuthModule,
    // UsersModule,
    // CoursesModule,
    // DirectionsModule,
    TasksModule,
  ],
})
export class AppModule {}

