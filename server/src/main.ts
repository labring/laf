import { NestFactory } from '@nestjs/core'
import * as compression from 'compression'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { HTTP_METHODS, ServerConfig } from './constants'
import { InitializerService } from './initializer/initializer.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: HTTP_METHODS,
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.enableVersioning({
    defaultVersion: ['1'],
    type: VersioningType.URI,
  })

  app.use(compression())

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('`The APIs of laf server`')
    .setVersion('1.0.alpha')
    .addServer(ServerConfig.API_SERVER_URL, 'current server')
    .addServer('http://dev.server:3000', 'dev server')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Authorization',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  })

  try {
    const initService = app.get(InitializerService)
    await initService.createDefaultRegion()
    await initService.createDefaultBundle()
    await initService.createDefaultRuntime()
    await initService.initMinioAlias()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  await app.listen(3000)
}
bootstrap()
