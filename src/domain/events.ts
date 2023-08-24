export abstract class Event {
  abstract name: string | symbol;

  ocurredAt = Date();
}

export interface EventHandler {
  handle(event: Event): void;
}

export const eventsSymbol = Symbol('app:events');

export const eventHandler = (name: string) => (target: any, propertyKey: string) => {
  Reflect.defineMetadata(eventsSymbol, name, target, propertyKey);
};
