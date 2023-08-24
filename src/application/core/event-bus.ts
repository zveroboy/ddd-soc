import { Event, eventsSymbol } from '#shared/index.js';
import EventEmitter from 'events';
import { injectable } from 'inversify';

interface IEventBus {
  dispatch(events: Event[]): void;
  use<T extends object>(handler: T): void;
}

@injectable()
export class EventBus extends EventEmitter implements IEventBus {
  dispatch(events: Event[]): void {
    events.forEach((event) => this.emit(event.name, event));
  }

  use<T extends object>(handler: T): void {
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
