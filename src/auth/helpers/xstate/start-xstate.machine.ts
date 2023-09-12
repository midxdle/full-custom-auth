import { HttpException } from '@nestjs/common'; // represent HTTP errors in a NestJS application
import { interpret, State } from 'xstate';
// XState is a JavaScript library for managing the state of complex and interactive systems

export const startXstate = <TContext>(
  service: ReturnType<typeof interpret<any>>,
): Promise<State<TContext>> => {
  return new Promise((resolve, reject) => {
    service
      .onDone(() => {
        const snapshot = service.getSnapshot();
        const { errorCode, errorMessage } = snapshot.context;
        if (errorCode) {
          reject(new HttpException(errorMessage, errorCode));
          return;
        }
        resolve(snapshot);
      })
      .start();
  });
};
