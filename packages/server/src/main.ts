import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // for swagger api
  const config = new DocumentBuilder()
    .setTitle('Open API Documentation of laf')
    .setDescription('The API of laf server')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('open-api', app, document)

  await app.listen(3000)
}
bootstrap()
