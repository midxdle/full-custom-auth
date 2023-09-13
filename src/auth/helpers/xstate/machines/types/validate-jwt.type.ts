import { UserDocument } from 'src/user/schemas/user.schema';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from 'src/auth/helpers/jwt/jwt.service';
import { UserService } from 'src/user/user.service';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

export interface ValidateJwtContext {
  authorizationHeader?: string | string[];
  authorizationCookie?: string;
  token?: string;
  user?: UserDocument;
  verifiedToken?: JwtPayload;
  jwtService?: JwtService;
  userService?: UserService;
  scopes?: string[];
  i18n?: I18nService;
  errorMessage?: string;
  errorCode?: number;
  response?: Response;
}

export type ValidateJwtServiceSchema = {
  verifyToken: {
    data: {
      verifiedToken: JwtPayload;
    };
  };

  verifyUser: {
    data: {
      user: UserDocument;
    };
  };

  checkScopes: {
    data: boolean;
  };
};
