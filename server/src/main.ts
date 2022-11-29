import { NestFactory } from '@nestjs/core'
import * as compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { HTTP_METHODS } from './constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: HTTP_METHODS,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.enableVersioning({
    defaultVersion: ['1'],
    type: VersioningType.URI,
  })

  app.use(compression())
  app.use(helmet())

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('`The APIs of laf server`')
    .setVersion('1.0.alpha')
    .addServer('http://localhost:3000', 'local server')
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
    },
  })

  await app.listen(3000)
}
bootstrap()
