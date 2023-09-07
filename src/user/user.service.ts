import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from 'src/auth/helpers/jwt/jwt.service';
import { CryptoService } from 'src/auth/helpers/crypto/crypto.service';
import { TokenOptions } from './token-options.interface';
import { UserToken } from './schemas/user-token.schema';

const MS_PER_SEC = 1000;
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createTokenForUser({
    user,
    expiration,
    scopes,
  }: TokenOptions): Promise<string> {
    const signedToken = this.jwtService.sign({
      subject: user.id,
      expiration: expiration,
    });

    const userToken = new UserToken({
      jti: this.cryptoService.hash(signedToken.jti),
      expires_at: new Date(signedToken.expiration * MS_PER_SEC),
      scopes,
    });

    user.tokens.push(userToken);

    await user.save();

    return signedToken.token;
  }

  userCanAccess(userToken: UserToken, scopes?: string[]) {
    if (!userToken.scopes || !userToken.scopes.length) {
      return true;
    }

    if (!scopes || !scopes.length) {
      return false;
    }

    return scopes.some((scope) => userToken.scopes.includes(scope));
  }

  async revokeTokenByJtiAndUserId(
    userId: string,
    jti: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      {
        id: userId,
        'tokens.jti': jti,
        'tokens.revoked_at': { $exists: false },
      },
      { $set: { 'tokens.$.revoked_at': new Date() } },
    );

    return result.modifiedCount === 1;
  }

  async findUserByJtiAndUserId(
    userId: string,
    jti: string,
  ): Promise<UserDocument> {
    const tokens = {
      $elemMatch: {
        jti: this.cryptoService.hash(jti),
        revoked_at: {
          $exists: false,
        },
      },
    };

    return this.userModel.findOne(
      {
        id: userId,
        tokens,
      },
      {
        tokens,
        version: 0,
      },
    );
  }

  async findOneById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({
      email: email,
    });
  }

  async createUser(user: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await this.cryptoService.hashPassword(user.password);

    const newUser = new this.userModel({
      email: user.email,
      username: user.username,
      password: hashedPassword,
    });

    return newUser.save();
  }
}
