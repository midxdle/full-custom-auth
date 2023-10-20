Let's break down the code you provided line by line, explaining each part in detail:

```javascript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config/dist';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
```

- This part of the code imports necessary modules and components from various packages:
  - `ValidationPipe` from `@nestjs/common`: A global validation pipe for input validation.
  - `NestFactory` from `@nestjs/core`: A factory for creating NestJS applications.
  - `ConfigService` from `@nestjs/config/dist`: A service to access application configuration.
  - `cookieParser` from `cookie-parser`: A middleware for parsing cookies in the HTTP request.
  - `AppModule` from `./app.module`: The main module of the NestJS application.
  - `setupSwagger` from `./swagger`: The function to set up Swagger documentation for the NestJS application.

```javascript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const swagger = configService.get('SWAGGER_ENABLED');
  if (swagger) setupSwagger(app);
  app.use(cookieParser());
  const port = configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
```

- The `bootstrap` function is defined as an asynchronous function, which is the entry point of the application.
- `NestFactory.create` is used to create an instance of the NestJS application using the `AppModule`.
- `app.useGlobalPipes(new ValidationPipe())` sets up a global validation pipe to validate input across the application.
- `const swagger = configService.get('SWAGGER_ENABLED');` retrieves a configuration value for Swagger enablement from the `ConfigService`.
- `if (swagger) setupSwagger(app);` conditionally sets up Swagger documentation based on the configuration.
- `app.use(cookieParser())` applies the cookie parsing middleware to the application.
- `const port = configService.get<number>('PORT');` retrieves the port from the configuration.
- `await app.listen(port);` starts the application by listening on the specified port.

Overall, this code sets up a NestJS application with global input validation using `ValidationPipe`, optionally configures Swagger documentation, applies cookie parsing middleware, and starts the application on a specified port.
