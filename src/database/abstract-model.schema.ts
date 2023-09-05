import { Exclude, Transform } from 'class-transformer';

export class AbstractModel<T> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @Transform((value) => value.obj.id.toString())
  id?: string;

  @Exclude()
  version: number;
}
