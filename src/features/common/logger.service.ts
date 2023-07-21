/* eslint-disable no-console */
export interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export class ConsoleLogger implements Logger {
  info(...args: unknown[]): void {
    const a = 0;

    console.info(...args);
  }

  error(...args: unknown[]): void {
    console.error(...args);
  }
}
