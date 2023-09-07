import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserToken } from './user-token.schema';
import { Exclude } from 'class-transformer';
import { AbstractModel } from 'src/database/abstract-model.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User extends AbstractModel<User> {
  @Prop({
    unique: true,
    required: true,
  })
  username: string;

  @Prop({
    unique: true,
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  @Exclude()
  password: string;

  @Prop()
  @Exclude()
  tokens?: UserToken[];
}

export const UserSchema = SchemaFactory.createForClass(User);
