import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { app } from '../src/app.js';

describe('Error handling', () => {
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
