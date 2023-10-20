This code defines the `UserService` in a NestJS application. Let's break down the code and explain each part in detail:

```javascript
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
```

- `Injectable` from `@nestjs/common` is a decorator used to define a class as a service that can be injected into other components.
- `CreateUserDto` and `UpdateUserDto` are data transfer objects (DTOs) used for creating and updating users, respectively.
- `InjectModel(User.name)` injects the Mongoose model for the `User` schema into the service.
- `User` and `UserDocument` are Mongoose schemas and document types for representing a user.
- `Model<UserDocument>` is the Mongoose model type for the `User` schema.
- `JwtService` and `CryptoService` are services related to JWT and cryptography.
- `TokenOptions` and `UserToken` are related to token options and the user token schema.

The rest of the code includes various methods that define the behavior and functionality of the `UserService`:

- `createTokenForUser`: Creates a token for a user based on given options.
- `userCanAccess`: Checks if a user can access based on their token and provided scopes.
- `revokeTokenByJtiAndUserId`: Revokes a token based on its JTI (JSON Token Identifier) and user ID.
- `findUserByJtiAndUserId`: Finds a user based on their JTI and user ID.
- `findOneById`: Finds a user by their ID.
- `findOneByEmail`: Finds a user by their email.
- `createUser`: Creates a new user by hashing the password and saving the user data.

Overall, this `UserService` provides methods for managing users, creating and handling tokens, and validating access based on tokens and scopes. It interacts with the Mongoose model and other services to handle user-related operations.
