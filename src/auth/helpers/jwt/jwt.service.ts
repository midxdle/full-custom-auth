import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { CryptoService } from '../crypto/crypto.service';
import { JwtModuleOptions } from './interfaces/module-options.interface';
import { SignTokenOptions } from './interfaces/sign-token-options.interface';
import { SignToken } from './interfaces/sign-token.interface';
import { MODULE_OPTIONS_TOKEN } from './jwt.module-definition';

const DEFAULT_EXPIRES_IN = 60 * 60;
const MS_PER_SEC = 1000;

@Injectable()
export class JwtService {
  constructor(
    private readonly cryptroService: CryptoService,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: JwtModuleOptions,
  ) {}

  sign(options: SignTokenOptions): SignToken {
    const expiration =
      Math.floor(Date.now() / MS_PER_SEC) +
      (options.expiration || this.options.expiration || DEFAULT_EXPIRES_IN);
    const jti = this.cryptroService.randomString(80);
    const token = jwt.sign(
      {
        expiration: expiration,
        subject: options.subject,
        jti: jti,
      },
      this.options.secret,
    );

    return {
      token: token,
      expiration: expiration,
      jti: this.cryptroService.hash(jti),
    };
  }

  verify(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.options.secret, (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }

        if (typeof decoded !== 'object') {
          reject(new Error('invalid token'));
          return;
        }

        resolve({
          ...decoded,
          jti: this.cryptroService.hash(decoded.jti),
        });
      });
    });
  }
}
