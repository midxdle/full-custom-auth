import { assign, createMachine } from 'xstate';
import {
  CreateUserContext,
  CreateUserServiceSchema,
} from './types/create-user.type';

const CreateUserMachine = createMachine<CreateUserContext>(
  {
    predictableActionArguments: true,
    context: {}, // context can hold data that the machine uses during its execution.
    schema: {
      services: {} as CreateUserServiceSchema,
    }, // can be used to specify the shape and types of services.
    initial: 'checking', // This is the initial state
    states: {
      checking: {
        invoke: {
          src: 'checkIfUserExists',
          onDone: {
            target: 'creating',
          },
          onError: {
            target: 'error',
            actions: 'assignErrorToContext',
          },
        },
        /**
         * call the checkUserIfExists service.
         * Depending on the outcome of this service,
         * the machine will transition to either the 'creating' state or the 'error' state.
         */
      },
      creating: {
        invoke: {
          src: 'createUser',
          onDone: {
            target: 'created',
            actions: 'assignDataToContext',
          },
          onError: {
            target: 'error',
            actions: 'assignErrorToContext',
          },
        },
      },
      created: {
        // invoke: [{ src: 'sendEmail' }],
        type: 'final',
      }, // a final state, indicating that the user creation process has been successfully completed.
      error: {
        type: 'final',
      },
    }, // defines the various states that the machine can be in
  },
  {
    actions: {
      assignDataToContext: assign((context, event) => {
        return {
          user: event.data.user,
          token: event.data.token,
        };
      }),
      /**
       * This action is used to update the context with user and token data
       * when the 'creating' state transitions to 'created'.
       */
      assignErrorToContext: assign((context, event) => {
        return {
          error: event.data.error,
          status: event.data.status,
        };
      }),
    },
  },
);

export default CreateUserMachine;
