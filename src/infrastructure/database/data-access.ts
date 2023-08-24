import type { EntityTarget, Repository } from 'typeorm';

export interface DataAccess {
  isInitialized: boolean;
  initialize(): Promise<DataAccess>;
  destroy(): Promise<void>;
  getRepository<Entity extends Record<string, any>>(target: EntityTarget<Entity>): Repository<Entity>;
}
