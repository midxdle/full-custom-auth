import { assign, createMachine } from 'xstate';
import {
  ValidateJwtContext,
  ValidateJwtServiceSchema,
} from './types/validate-jwt.type';
import { HttpStatus } from '@nestjs/common';
import { COOKIE_JWT_KEY } from '../../constants';

const validateJwtMachine = createMachine<ValidateJwtContext>(
  {
    id: 'validateJwt',
    predictableActionArguments: true,
    /**
     * it promotes consistency and clarity in your state machine code.
     * It makes it easier to understand and reason about what data will be available to an action when it's executed.
     * Developers can quickly identify what to expect in the action's parameters.
     * When predictableActionArguments is set to true, the common argument shape for actions becomes:
     * (context, event, meta) => {}
     * context: The current context of the state machine.
     * event: The event that triggered the state transition.
     * meta: Additional metadata related to the state transition.
     * This consistent argument shape makes it easier to work with actions consistently across different parts of your state machine.
     * It helps reduce confusion and errors that can arise when the argument shapes vary between actions.
     */
    context: {},
    schema: {
      services: {} as ValidateJwtServiceSchema,
    },
    initial: 'parsingTokenFromCookie',
    states: {
      parsingTokenFromCookie: {
        always: [
          {
            target: 'verifyingToken',
            cond: 'isValidCookie',
            actions: assign((context) => {
              return {
                token: context.authorizationCookie,
              };
            }),
          },
          {
            target: 'parsingTokenFromHeader',
          },
        ],
      },
      parsingTokenFromHeader: {
        always: [
          {
            target: 'verifyingToken',
            cond: 'isValidHeader',
            actions: 'assignTokenToContext',
          },
          {
            target: 'invalidHeader',
          },
        ],
      },
      verifyingToken: {
        invoke: {
          src: 'verifyToken',
          onDone: {
            target: 'verifyingUser',
            actions: 'assignVerifiedTokenToContext',
          },
          onError: {
            target: 'invalidToken',
          },
        },
      },
      verifyingUser: {
        invoke: {
          src: 'verifyUser',
          onDone: {
            target: 'checkingScopes',
            actions: 'assignUserToContext',
          },
          onError: {
            target: 'unauthorized',
          },
        },
      },
      checkingScopes: {
        invoke: {
          src: 'checkScopes',
          onDone: {
            target: 'authorized',
          },
          onError: {
            target: 'forbidden',
          },
        },
      },
      authorized: {
        type: 'final',
      },
      unauthorized: {
        entry: ['assignUnauthorizedErrorToContext', 'clearCookie'],
        type: 'final',
      },
      invalidToken: {
        entry: ['assignUnauthorizedErrorToContext', 'clearCookie'],
        type: 'final',
      },
      invalidHeader: {
        entry: ['assignUnauthorizedErrorToContext', 'clearCookie'],
        type: 'final',
      },
      forbidden: {
        entry: assign((context) => ({
          errorCode: HttpStatus.FORBIDDEN,
          errorMessage: context.i18n.translate('errors.forbidden'),
        })),
        type: 'final',
      },
    },
  },
  {
    services: {
      verifyToken: (context) => {
        return context.jwtService.verify(context.token);
      },
      verifyUser: async (context) => {
        try {
          const user = await context.userService.findUserByJtiAndUserId(
            context.verifiedToken.jti,
            context.verifiedToken.subject,
          );

          if (!user) {
            return Promise.reject('');
          }

          return Promise.resolve(user);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      checkScopes: (context) => {
        const tokenCanAccess = context.userService.userCanAccess(
          context.user.tokens[0],
          context.scopes,
        );
        if (!tokenCanAccess) {
          return Promise.reject('');
        }

        return Promise.resolve(true);
      },
    },
    actions: {
      assignTokenToContext: assign((context) => {
        const [_, token] = (context.authorizationHeader as string).split(' ');
        return {
          token,
        };
      }),
      assignVerifiedTokenToContext: assign((_, event) => {
        return {
          verifiedToken: event.data,
        };
      }),
      assignUserToContext: assign((_, event) => {
        return {
          user: event.data,
        };
      }),
      assignUnauthorizedErrorToContext: assign((context) => ({
        errorCode: HttpStatus.UNAUTHORIZED,
        errorMessage: context.i18n.translate('errors.unauthorized'),
      })),
      clearCookie: (context) => {
        context.response.clearCookie(COOKIE_JWT_KEY);
      },
    },
    guards: {
      isValidHeader: ({ authorizationHeader }) => {
        return !(!authorizationHeader || Array.isArray(authorizationHeader));
      },
      isValidCookie: ({ authorizationCookie }) => {
        return !!authorizationCookie;
      },
    },
  },
);

export default validateJwtMachine;
