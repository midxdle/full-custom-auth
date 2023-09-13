import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';

export interface CreateUserContext {
  dto?: CreateUserDto;
  user?: User;
  token?: string;
  error?: string;
  status?: number;
}

export type CreateUserServiceSchema = {
  createUser: {
    data: {
      user: UserDocument;
      token: string;
    };
  };
};
