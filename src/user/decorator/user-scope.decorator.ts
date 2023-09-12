import { SetMetadata } from '@nestjs/common';
/**
 * The SetMetadata decorator is used in NestJS to add metadata (custom data) to classes, methods, or routes.
 * It's often used for things like adding roles, permissions, or other custom information to controllers and routes.
 */

export const KEY_OF_SCOPES = 'token_of_scopes';

export const Scopes = (...scopes: string[]) =>
  SetMetadata(KEY_OF_SCOPES, scopes);
/**
 * This code defines a decorator function named Scopes.
 * Decorators in NestJS are used to add metadata to classes, methods, or properties.
 *
 * Essentially, when you apply the Scopes decorator to a controller, method, or route in your NestJS application,
 * it associates the specified access scopes (provided as arguments to Scopes) with that element.
 * This can be useful for implementing authorization and access control mechanisms based on scopes or permissions.
 * Example: @Scopes('read:item', 'write:item')
 */
