import { eventsSymbol } from '#shared/decorators.js';
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

  use<T extends object>(handler: T) {
    /** @todo consider parse simple object */
    const prototype = Object.getOwnPropertyNames(Object.getPrototypeOf(handler)).filter(
      (prop) => prop !== 'constructor' || typeof handler[prop] !== 'function'
    );

    for (const prop of prototype) {
      const eventName: string | undefined = Reflect.getMetadata(eventsSymbol, handler, prop);
      if (eventName?.length) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.on(eventName, (handler[prop as keyof T] as Function).bind(handler));
      }
    }
  }
}
