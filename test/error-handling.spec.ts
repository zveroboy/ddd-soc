import { ApplicationService, container } from '#infrastructure/index.js';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';

let application: ApplicationService;

describe('Error handling', () => {
  before(async () => {
    application = await container.getAsync<ApplicationService>(ApplicationService);
  });

  after(async () => {
    await application.destroy();
  });

  it('should correctly respond if found', async () => {
    const response = await request(application.app).get('/');
    assert.equal(response.status, StatusCodes.OK);
    assert.ok(response.text.startsWith('version '));
  });

  it('should correctly respond if not found', async () => {
    const response = await request(application.app).get('/not-exists');
    assert.equal(response.status, StatusCodes.NOT_FOUND);
  });
});
