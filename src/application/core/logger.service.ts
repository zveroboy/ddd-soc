import { injectable } from 'inversify';

/* eslint-disable no-console */
export interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
