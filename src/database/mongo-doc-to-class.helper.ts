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
    /**
     * converts it to a plain JavaScript object using document.toJSON()
     * and then uses plainToInstance to create an instance of the specified type
     */
  }

  return plainToInstance(type, document.toJSON());
}

/**
 * The purpose of this function is to bridge the gap between MongoDB documents
 * and instances of specific classes. In many applications,
 * MongoDB documents are retrieved from the database as plain JavaScript objects,
 * but it's often useful to work with them as instances of specific classes with methods and behaviors.
 *
 * By using this function, you can easily convert MongoDB documents into instances of classes defined in your NestJS application
 * This can be particularly handy when you want to work with documents in a more object-oriented manner,
 * allowing you to take advantage of class-specific methods and encapsulation.
 */
