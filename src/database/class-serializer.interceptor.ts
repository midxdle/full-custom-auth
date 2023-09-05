import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';
import { isObject } from './check-object-type.utils';

function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(document: PlainLiteralObject) {
      return plainToInstance(classToIntercept, document.JSON());
    }

    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ) {
      if (response instanceof Document) {
        return this.changePlainObjectToClass(response);
      }

      if (isObject(response)) {
        const modifiedResponse = {};
        for (const key in response) {
          const PlainLiteralObject = response[key];
          modifiedResponse[key] =
            PlainLiteralObject instanceof Document
              ? this.changePlainObjectToClass(PlainLiteralObject)
              : PlainLiteralObject;
        }

        return modifiedResponse;
      }

      if (Array.isArray(response)) {
        return response.map((plainLiteralObject: PlainLiteralObject) => {
          if (plainLiteralObject instanceof Document) {
            return this.changePlainObjectToClass(plainLiteralObject);
          }

          return plainLiteralObject;
        });
      }

      return response;
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}

export default MongooseClassSerializerInterceptor;
