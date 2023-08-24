import { Event } from '../domain/events.js';

export type Result<R> = Error | R;
export type ResultWithEvents<R, P = unknown> = {
  result: Result<R>;
  events: Event[];
};
