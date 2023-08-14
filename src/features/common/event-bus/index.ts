import EventEmitter from 'events';
import { injectable } from 'inversify';

export type Event<P> = {
  name: string | symbol;
  payload?: P;
};

@injectable()
export class EventBus extends EventEmitter {
  dispatch<P = unknown>(event: Event<P>) {
    this.emit(event.name, event.payload);
  }
}
