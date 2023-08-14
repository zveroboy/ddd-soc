export const eventsSymbol = Symbol('app:events');

export const eventHandler = (name: string) => (target: any, propertyKey: string) => {
  Reflect.defineMetadata(eventsSymbol, name, target, propertyKey);
};
