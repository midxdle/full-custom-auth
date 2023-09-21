import {
  INestApplication,
  ModuleMetadata,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import {
  closeMongoServerConnection,
  testMongooseModule,
} from './mongoose.module.test';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from 'src/auth/helpers/crypto/crypto.module';
import { JwtModule } from 'src/auth/helpers/jwt/jwt.module';
import { UserModule } from 'src/user/user.module';
import * as path from 'path';

export const createBaseTestingModule = (metadata: ModuleMetadata) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      I18nModule.forRoot({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: path.resolve(__dirname, '../../src/auth/helpers/i18n/'),
          watch: true,
        },
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          AcceptLanguageResolver,
        ],
      }),
      JwtModule.forRoot({
        secret: 'secret',
      }),
      testMongooseModule(),
      ...(metadata.imports || []),
      CryptoModule,
      UserModule,
    ],
    providers: [...(metadata.providers || [])],
    exports: [...(metadata.exports || [])],
    controllers: [...(metadata.controllers || [])],
  });
};

export const createBaseNestApplication = async (
  moduleFixture: TestingModule,
) => {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  return app;
};

export const closeAllConnections = async ({
  module,
}: {
  module?: TestingModule | INestApplication;
}) => {
  await closeMongoServerConnection();
  await module?.close();
};
