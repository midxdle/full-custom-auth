import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtGuard } from './helpers/jwt/jwt.guard';
import { interpret } from 'xstate';
import CreateUserMachine from './helpers/xstate/machines/create-user.machine';
import loginUserMachine from './helpers/xstate/machines/login-user.machine';
import { UserService } from 'src/user/user.service';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { CryptoService } from './helpers/crypto/crypto.service';
import MongooseClassSerializerInterceptor from 'src/database/class-serializer.interceptor';
import { User as UserModel, UserDocument } from 'src/user/schemas/user.schema';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { currentUser } from 'src/user/decorator/current-user.decorator';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AUTH_ROUTE_PREFIX } from './helpers/constants';
import { COOKIE_JWT_KEY } from './helpers/constants';

@Controller(AUTH_ROUTE_PREFIX)
@UseInterceptors(MongooseClassSerializerInterceptor(UserModel))
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private i18nService: I18nService,
    private readonly cryptoService: CryptoService,
  ) {}

  @Post('register')
  createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const service = interpret(
      CreateUserMachine.withContext({
        dto: createUserDto,
      }).withConfig({
        services: {
          checkIfUserExists: async (context) => {
            try {
              const user = await this.userService.findOneByEmail(
                context.dto.email,
              );

              if (user) {
                return Promise.reject({
                  error: this.i18nService.translate('auth.errors.userExists'),
                  status: HttpStatus.BAD_REQUEST,
                });
              }

              return Promise.resolve(true);
            } catch (error) {
              return Promise.reject({
                error: this.i18nService.translate('server.errors.server'),
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              });
            }
          },
          createUser: async (context) => {
            try {
              const user = await this.userService.createUser(context.dto);
              const token = await this.userService.createTokenForUser({ user });
              return Promise.resolve({ user, token });
            } catch (error) {
              return Promise.reject({
                error: this.i18nService.translate('server.errors.server'),
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              });
            }
          },
        },
      }),
    );

    return new Promise((resolve, reject) => {
      service
        .onDone(() => {
          const snapshot = service.getSnapshot();

          if (snapshot.matches('error')) {
            reject(
              new HttpException(
                snapshot.context.error,
                snapshot.context.status,
              ),
            );

            return;
          }

          response.cookie(COOKIE_JWT_KEY, snapshot.context.token, {
            httpOnly: true,
            sameSite: 'strict',
          });

          resolve({
            user: snapshot.context.user,
            token: snapshot.context.token,
          });
        })
        .start();
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const service = interpret(
      loginUserMachine
        .withContext({
          dto: loginDto,
        })
        .withConfig({
          services: {
            findUserByEmail: async (context) => {
              try {
                const user = await this.userService.findOneByEmail(
                  context.dto.email,
                );

                if (!user) {
                  return Promise.reject({
                    error: this.i18nService.translate(
                      'auth.errors.userNotFound',
                    ),
                    status: HttpStatus.BAD_REQUEST,
                  });
                }

                return Promise.resolve({
                  user,
                });
              } catch (error) {
                return Promise.reject({
                  error: this.i18nService.translate('server.errors.server'),
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                });
              }
            },
            checkPassword: async (context) => {
              try {
                const isMatch = await this.cryptoService.comparePasswords(
                  context.dto.password,
                  context.user.password,
                );

                if (!isMatch) {
                  return Promise.reject({
                    error: this.i18nService.translate(
                      'auth.errors.wrongPassword',
                    ),
                    status: HttpStatus.BAD_REQUEST,
                  });
                }

                return Promise.resolve();
              } catch (error) {
                return Promise.reject({
                  error: this.i18nService.translate('server.errors.server'),
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                });
              }
            },
            createUserToken: async (context) => {
              try {
                const token = await this.userService.createTokenForUser({
                  user: context.user,
                });

                return Promise.resolve({
                  token,
                });
              } catch (error) {
                return Promise.reject({
                  error: this.i18nService.translate('server.errors.server'),
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                });
              }
            },
          },
        }),
    );

    return new Promise((resolve, reject) => {
      service
        .onDone(() => {
          const snapshot = service.getSnapshot();

          if (!snapshot.matches('tokenCreated')) {
            reject(
              new HttpException(
                snapshot.context.error,
                snapshot.context.status,
              ),
            );

            return;
          }

          response.cookie(COOKIE_JWT_KEY, snapshot.context.token, {
            httpOnly: true,
            sameSite: 'strict',
          });

          resolve({
            user: snapshot.context.user,
            token: snapshot.context.token,
          });
        })
        .start();
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('user')
  async getUser(@currentUser() user: UserDocument) {
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @currentUser() user: UserDocument,
  ) {
    await this.userService.revokeTokenByJtiAndUserId(
      user.id,
      user.tokens[0].jti,
    );
    response.clearCookie(COOKIE_JWT_KEY);
    return {};
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
