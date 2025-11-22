import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { TasksService } from './tasks.service'
import * as path from 'path'
import * as fs from 'fs'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('subject') subject?: string,
    @Query('topicId') topicId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('topicLine') topicLine?: string,
  ) {
    return this.tasksService.findAll(
      subject,
      topicId ? parseInt(topicId) : undefined,
      categoryId ? parseInt(categoryId) : undefined,
      topicLine,
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Get('subject/:subject')
  findBySubject(@Param('subject') subject: string) {
    return this.tasksService.findBySubject(subject)
  }

  @Get('meta/topics')
  getTopics() {
    return this.tasksService.getTopics()
  }

  @Get('meta/categories')
  getCategories() {
    return this.tasksService.getCategories()
  }

  @Get('meta/subjects')
  getSubjects() {
    return this.tasksService.getSubjects()
  }

  @Get('meta/lines')
  getTopicLines(@Query('subject') subject?: string) {
    return this.tasksService.getTopicLines(subject)
  }

  @Get('images/*')
  getImage(@Param('0') imagePath: string, @Res() res: Response) {
    // Безопасность: проверяем, что путь не содержит опасные символы
    if (imagePath.includes('..')) {
      return res.status(400).send('Invalid path')
    }

    // Нормализуем путь (заменяем обратные слеши на прямые)
    const normalizedPath = imagePath.replace(/\\/g, '/')
    
    // Убираем префикс image_tasksdb/ если он есть в пути
    let cleanPath = normalizedPath
    if (normalizedPath.startsWith('image_tasksdb/')) {
      cleanPath = normalizedPath.substring('image_tasksdb/'.length)
    }

    // Путь к папке с изображениями относительно папки server
    // В dev: __dirname = server/dist/modules/tasks -> ../../image_tasksdb
    // В prod: __dirname = dist/modules/tasks -> ../../image_tasksdb
    const serverPath = path.resolve(__dirname, '../../')
    const fullPathFromDirname = path.join(serverPath, 'image_tasksdb', cleanPath)
    
    // Альтернативный путь через process.cwd() (если запускается из папки server)
    const cwdPath = path.join(process.cwd(), 'image_tasksdb', cleanPath)
    
    console.log('Запрос изображения:', normalizedPath)
    console.log('Очищенный путь:', cleanPath)
    console.log('Путь через __dirname:', fullPathFromDirname)
    console.log('Путь через process.cwd():', cwdPath)
    
    let fullPath = fullPathFromDirname
    if (!fs.existsSync(fullPathFromDirname)) {
      if (fs.existsSync(cwdPath)) {
        fullPath = cwdPath
        console.log('Используется путь через process.cwd()')
      } else {
        console.error(`Изображение не найдено по путям: ${fullPathFromDirname} или ${cwdPath}`)
        return res.status(404).send(`Image not found: ${cleanPath}`)
      }
    }

    // Определяем MIME-тип по расширению файла
    const ext = path.extname(cleanPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    // Устанавливаем заголовки и отправляем файл
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Кэш на год
    
    return res.sendFile(path.resolve(fullPath))
  }
}

