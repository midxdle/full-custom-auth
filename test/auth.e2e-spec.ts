import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createBaseNestApplication,
  createBaseTestingModule,
  closeAllConnections,
} from './modules/module.test';
import { UserFactory } from './factories/user.factory';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { authenticatedRequest } from './requests.test';
import { AUTH_ROUTE_PREFIX } from 'src/auth/helpers/constants';

const USER_ROUTE = `${AUTH_ROUTE_PREFIX}/user`;
const REGISTER_ROUTE = `${AUTH_ROUTE_PREFIX}/register`;
const LOGIN_ROUTE = `${AUTH_ROUTE_PREFIX}/login`;
const LOGOUT_ROUTE = `${AUTH_ROUTE_PREFIX}/logout`;

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let userService: UserService;

  beforeEach(async () => {
    const module = await createBaseTestingModule({
      imports: [AuthModule],
    }).compile();

    userFactory = new UserFactory().setModel(module);

    userService = module.get(UserService);

    app = await createBaseNestApplication(module);

    await app.init();
  });

  describe('user (POST)', () => {
    it('it should create a user', async () => {
      return request(app.getHttpServer())
        .post(REGISTER_ROUTE)
        .send({
          email: userFactory.faker.internet.email(),
          username: userFactory.faker.internet.userName(),
          password: userFactory.faker.internet.password(),
        })
        .expect(HttpStatus.CREATED)
        .then((response) => {
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('token');
        });
    });

    it('it should not create a user with an existing email', async () => {
      const user = await userFactory.create();
      return request(app.getHttpServer())
        .post(REGISTER_ROUTE)
        .send({
          email: user.email,
          username: userFactory.faker.internet.userName(),
          password: userFactory.faker.internet.userName(),
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toEqual('User Already Exists');
        });
    });

    it('should return a server error if an exception occurs during user creation', async () => {
      const createUserDto = {
        email: userFactory.faker.internet.email(),
        username: userFactory.faker.internet.userName(),
        password: userFactory.faker.internet.password(),
      };

      jest.spyOn(userService, 'createUser').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      return request(app.getHttpServer())
        .post(REGISTER_ROUTE)
        .send(createUserDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then((response) => {
          expect(response.body.message).toEqual('Server Error');
        });
    });
  });

  describe('user (GET)', () => {
    it('should return a user by token', async () => {
      const [user, token] = await userFactory.createWithToken();

      return authenticatedRequest(app.getHttpServer(), token)
        .get(USER_ROUTE)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.email).toEqual(user.email);
        });
    });

    it('should return auth error if token is invalid', async () => {
      return authenticatedRequest(app.getHttpServer(), 'invalid')
        .get(USER_ROUTE)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => {
          expect(response.body.message).toEqual('Unauthorized');
        });
    });
  });

  describe('login (POST)', () => {
    it('should login a user (tokenCreated status)', async () => {
      const user = await userFactory.create();

      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send({
          email: user.email,
          password: 'myPassword123',
        })
        .expect(HttpStatus.CREATED)
        .then((response) => {
          expect(response.body).toHaveProperty('token');
        });
    });

    it('should return a bad request error if email is missing (userNotFound status)', async () => {
      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send({
          email: 'test@gmail.com',
          password: 'myPassword123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual('User not Found');
        });
    });

    it('should return a bad request if password is missing', async () => {
      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send({
          email: 'test@gmail.com',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual([
            'Password should not be Empty',
          ]);
        });
    });

    it('should return a bad request if email is invalid', async () => {
      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send({
          email: 'invalid',
          password: 'myPassword123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual(['Email format is Invalid']);
        });
    });

    it('should return a bad request if password is incorrect (passwordNotMatched status)', async () => {
      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send({
          email: 'test@gmail.com',
          password: 'wrongPassword',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual('Wrong Password');
        });
    });

    it('should return a server error if an exception occurs during findUserByEmail (userNotFound status)', async () => {
      const loginDto = {
        email: userFactory.faker.internet.email(),
        username: userFactory.faker.internet.userName(),
        password: userFactory.faker.internet.password(),
      };

      jest.spyOn(userService, 'findOneByEmail').mockImplementation(() => {
        throw new Error('Test error');
      });

      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send(loginDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then((response) => {
          expect(response.body.message).toEqual('Server Error');
        });
    });

    it('should return a server error if an exception occurs during creating a token (tokenNotCreated)', async () => {
      const user = await userFactory.create();
      const loginDto = {
        email: user.email,
        username: user.username,
        password: 'myPassword123',
      };

      jest.spyOn(userService, 'createTokenForUser').mockImplementation(() => {
        throw new Error('Test error');
      });

      return request(app.getHttpServer())
        .post(LOGIN_ROUTE)
        .send(loginDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then((response) => {
          expect(response.body.message).toEqual('Server Error');
        });
    });
  });

  describe('logout (POST)', () => {
    it('', async () => {
      const user = await userFactory.create();
      const token = await userService.createTokenForUser({ user });

      const response = await authenticatedRequest(app.getHttpServer(), token)
        .post(LOGOUT_ROUTE)
        .expect(HttpStatus.CREATED);

      const loggedOutUser = await userService.findUserByJtiAndUserId(
        user.tokens[0].jti,
        user.id,
      );
      expect(response.header['set-cookie'][0]).toMatch(/token=;/);
      expect(loggedOutUser).toBeNull();
    });

    it('should return an unauthorized error if the user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post(LOGOUT_ROUTE)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterEach(async () => {
    await closeAllConnections({
      module: app,
    });
  });
});
