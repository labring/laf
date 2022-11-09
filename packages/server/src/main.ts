/*
 * @Author: maslow wangfugen@126.com
 * @Date: 2022-11-08 21:41:06
 * @LastEditors: maslow wangfugen@126.com
 * @LastEditTime: 2022-11-09 17:35:47
 * @FilePath: /laf/packages/server/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}
bootstrap()
