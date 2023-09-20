import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication, path = 'api') => {
  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('Documentation')
    .setDescription('API Documentation')
    .setVersion('0.1')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    documentBuilderConfig,
  );
  SwaggerModule.setup(path, app, swaggerDocument);
};
