import { Document } from 'mongoose';
import { PlainLiteralObject } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export function mongoDocToClassChanger(
  document: Document | Document[] | undefined | null,
  type: new (partial: object) => unknown,
): PlainLiteralObject | PlainLiteralObject[] | undefined | null {
  if (!document) {
    return document;
  }

  if (Array.isArray(document)) {
    return document.map((document) => plainToInstance(type, document.toJSON()));
  }

  return plainToInstance(type, document.toJSON());
}
