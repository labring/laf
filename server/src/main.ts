import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('v1')

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('`The APIs of laf server`')
    .setVersion('1.0.alpha')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap()
