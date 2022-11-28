import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      // TODO: only allow localhost:3000
      origin: 'http://localhost:3001',
      credentials: true,
    },
  })

  app.setGlobalPrefix('v1')

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('`The APIs of laf server`')
    .setVersion('1.0.alpha')
    .addServer('http://localhost:3000')
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
