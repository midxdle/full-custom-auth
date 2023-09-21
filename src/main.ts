import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config/dist';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const swagger = configService.get('SWAGGER_ENABLED');
  if (swagger) {
    setupSwagger(app);
  }
  app.use(cookieParser());
  const port = configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
