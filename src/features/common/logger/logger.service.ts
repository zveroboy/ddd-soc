import { injectable } from 'inversify';

/* eslint-disable no-console */
export interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

@injectable()
export class ConsoleLogger implements Logger {
  info(...args: unknown[]): void {
    console.info(...args);
  }

  error(...args: unknown[]): void {
    console.error(...args);
  }
}
