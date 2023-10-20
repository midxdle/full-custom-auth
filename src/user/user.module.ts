import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CryptoModule } from 'src/auth/helpers/crypto/crypto.module';
import { JwtModule } from 'src/auth/helpers/jwt/jwt.module';

@Module({
  imports: [
    CryptoModule,
    JwtModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
