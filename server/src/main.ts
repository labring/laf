import { NestFactory } from '@nestjs/core'
import * as compression from 'compression'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ServerConfig } from './constants'
import { InitializerService } from './initializer/initializer.service'
import { SystemDatabase, TrafficDatabase } from './system-database'
import * as helmet from 'helmet'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  await SystemDatabase.ready

  if (ServerConfig.TRAFFIC_DATABASE_URL) {
    await TrafficDatabase.ready
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )

  app.enableVersioning({
    defaultVersion: ['1'],
    type: VersioningType.URI,
  })

  app.use(compression())
  app.use(helmet.hidePoweredBy())
  app.use(bodyParser.json({ limit: '1mb' }))

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('`The APIs of laf server`')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .setVersion(require('../package.json').version)
    .addServer(ServerConfig.API_SERVER_URL, 'current server')
    .addServer('http://dev.server:3000', 'dev server')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Authorization',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  })

  try {
    const initService = app.get(InitializerService)
    await initService.init()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  }

  await app.listen(3000)
}
bootstrap()
