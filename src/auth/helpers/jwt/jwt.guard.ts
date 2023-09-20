import {
  CanActivate,
  ExecutionContext,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { IncomingMessage } from 'http';
import { Response } from 'express';
import { interpret } from 'xstate';
import { startXstate } from '../xstate/start-xstate.machine';
import validateJwtMachine from '../xstate/machines/validate-jwt.machine';
import { ValidateJwtContext } from '../xstate/machines/types/validate-jwt.type';
import { UserDocument } from 'src/user/schemas/user.schema';
import { JwtService } from './jwt.service';
import { UserService } from 'src/user/user.service';
import { KEY_OF_SCOPES } from 'src/user/decorator/user-scope.decorator';
import { COOKIE_JWT_KEY } from '../constants';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private i18nService: I18nService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as IncomingMessage & {
      user?: UserDocument;
      cookies: PlainLiteralObject;
    };

    const response = context.switchToHttp().getResponse() as Response;

    const scopes = this.reflector.getAllAndOverride<string[]>(KEY_OF_SCOPES, [
      context.getHandler(),
      context.getClass(),
    ]);

    const service = interpret(
      validateJwtMachine.withContext({
        authorizationHeader: request.headers['authorization'],
        authorizationCookie: request.cookies
          ? request.cookies[COOKIE_JWT_KEY]
          : undefined,
        jwtService: this.jwtService,
        userService: this.userService,
        i18n: this.i18nService,
        scopes: scopes,
        response,
      }),
    );

    const snapshot = await startXstate<ValidateJwtContext>(service);

    request.user = snapshot.context.user;

    return true;
  }
}
