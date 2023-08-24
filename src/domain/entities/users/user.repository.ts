/** @todo remove typeorm dependency. Used for simplicity */
import type { Repository } from 'typeorm';

import { User } from './user.entity.js';

export type UserRepository = Repository<User>;
