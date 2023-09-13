import { UserDocument } from 'src/user/schemas/user.schema';
import { LoginDto } from 'src/auth/dto/login-auth.dto';

export interface LoginUserContext {
  dto?: LoginDto;
  user?: UserDocument;
  token?: string;
  error?: string;
  status?: number;
}

export type LoginUserServiceSchema = {
  findUserById: {
    data: {
      user?: UserDocument;
      error?: string;
      status?: number;
    };
  };

  checkUserPassword: {
    data: void;
  };

  createUserToken: {
    data: {
      token: string;
    };
  };
};
