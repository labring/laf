import { NestFactory } from '@nestjs/core';
import { BackupModule } from './backup.module';



async function bootstrap() {
	const app = await NestFactory.create(BackupModule);
	await app.listen(3000);
}
bootstrap();
