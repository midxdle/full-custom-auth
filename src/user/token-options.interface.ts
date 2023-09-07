import { UserDocument } from './schemas/user.schema';

export interface TokenOptions {
  user: UserDocument;
  expiration?: number;
  scopes?: string[];
}
