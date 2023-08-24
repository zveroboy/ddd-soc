import { eventHandler } from '#shared/decorators.js';
import { injectable } from 'inversify';

@injectable()
export class AuthEventHandler {
  // @eventHandler('user.registered')
  registerHandler(payload: unknown) {
    console.log({ payload });
  }
}
