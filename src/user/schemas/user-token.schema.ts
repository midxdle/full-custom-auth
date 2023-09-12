import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UserToken {
  constructor(partial: Partial<UserToken>) {
    Object.assign(this, partial);
  }
  /**
   * The constructor is using a common pattern for initializing objects with partial data.
   * This is often seen in classes where you want to allow users to create instances of the class,
   * by providing only a subset of the properties, with default values for the rest.
   */

  @Prop({
    required: true,
  })
  jti: string;

  @Prop({
    required: true,
  })
  expires_at: Date;

  @Prop()
  revoked_at?: Date;

  @Prop()
  scopes?: string[];
}
