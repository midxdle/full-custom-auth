import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CryptoModule } from './helpers/crypto/crypto.module';
import { JwtModule } from './helpers/jwt/jwt.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    CryptoModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
