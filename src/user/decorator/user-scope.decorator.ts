import { SetMetadata } from '@nestjs/common';

export const KEY_OF_SCOPES = 'token_of_scopes';
export const Scopes = (...scopes: string[]) =>
  SetMetadata(KEY_OF_SCOPES, scopes);
