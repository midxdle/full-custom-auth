export interface JwtModuleOptions {
  secret: string;
  expiration?: number;
}

export const jwtModuleOptions: JwtModuleOptions = {
  secret: 'secret',
  expiration: 0,
};
