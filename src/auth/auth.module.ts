import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CryptoModule } from './helpers/crypto/crypto.module';
import { JwtModule } from './helpers/jwt/jwt.module';

@Module({
  imports: [CryptoModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
