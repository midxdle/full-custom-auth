import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const currentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
/**
 * retrieve the current user from the request object when it's applied to a method or route parameter.
 * This assumes that the user property has been previously attached to the request object,
 * typically through authentication middleware.
 */
