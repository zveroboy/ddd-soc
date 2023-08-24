import { Event } from '../domain/events.js';

export abstract class AggregateRoot {
  #events: Event[] = [];

  raise(event: Event) {
    this.#events.push(event);
  }

  consumeEvents() {
    const events = this.#events;
    this.#events = [];
    return events;
  }
}
