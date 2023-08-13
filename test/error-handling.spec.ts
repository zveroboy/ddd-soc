// import { before, beforeEach, describe, it, mock } from 'node:test';
import { Application } from '#bootstrap/application.js';
import { container } from '#bootstrap/di.js';
import { beforeAll, describe, expect, it, test } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

// import { app } from '../src/application.js';

let userRepository: Repository<User>;
let application: Application;

describe('Error handling', () => {
  beforeAll(async () => {
    application = await Application.create(container);
    userRepository = AppDataSource.getRepository(User);
  });

  it('should correctly respond if found', async () => {
    const response = await request(app).get('/');
    assert.equal(response.status, StatusCodes.OK);
    assert.equal(response.text, 'foo bar');
  });

  it('should correctly respond if not found', async () => {
    const response = await request(app).get('/not-exists');
    assert.equal(response.status, StatusCodes.NOT_FOUND);
  });
});
