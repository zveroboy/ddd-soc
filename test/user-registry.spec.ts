/* eslint-disable max-statements */

/* eslint-disable no-magic-numbers */

/* eslint-disable max-lines-per-function */
import { app } from '#app.js';
import AppDataSource from '#database/data-source.js';
import { RegisterDto, User } from '#features/auth/index.js';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { Repository } from 'typeorm';

let userRepository: Repository<User>;

describe.only('User', () => {
  before(() => {
    // await AppDataSource.initialize();
    userRepository = AppDataSource.getRepository(User);
  });

  after(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(() => userRepository.clear());

  it.skip('should correctly add', async () => {
    const response = await request(app).get('/');
    assert.equal(response.status, StatusCodes.OK);
    assert.equal(response.text, 'foo bar');

    const [, count] = await userRepository.findAndCount();
    assert.equal(count, 0);
  });

  it.only('should fail on invalid register input', async () => {
    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 0);
    }

    const registerDto: RegisterDto = {
      email: 'john.smith',
      password: 'john.smith.123',
    };

    {
      const response = await request(app).post('/auth/register').send(registerDto);
      assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.equal(response.text, `${registerDto.email} created`);
    }
  });

  it.only('should correctly register and login', async () => {
    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 0);
    }

    const registerDto: RegisterDto = {
      email: 'john.smith+1@gmail.com',
      password: 'john.smith.123',
    };

    {
      const response = await request(app).post('/auth/register').send(registerDto);
      assert.equal(response.status, StatusCodes.CREATED);
      assert.equal(response.text, `${registerDto.email} created`);
    }

    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 1);
    }

    {
      const response = await request(app)
        .post('/auth/login')
        .send({
          ...registerDto,
          password: 'wrong_password',
        });

      assert.equal(response.status, StatusCodes.FORBIDDEN);
    }

    {
      const response = await request(app)
        .post('/auth/login')
        .send({
          ...registerDto,
          email: 'wrong_email@gmail.com',
        });

      assert.equal(response.status, StatusCodes.FORBIDDEN);
    }

    {
      const response = await request(app).post('/auth/login').send({
        email: 'john.smith+1@gmail.com',
        password: 'john.smith.123',
      });

      assert.equal(response.status, StatusCodes.OK);
    }
  });

  it.skip('should not allow register twice', async () => {
    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 0);
    }

    const registerDto: RegisterDto = {
      email: 'john.smith+1@gmail.com',
      password: 'john.smith.123',
    };

    {
      const response = await request(app).post('/auth/register').send(registerDto);
      assert.equal(response.status, StatusCodes.CREATED);
      assert.equal(response.text, `${registerDto.email} created`);
    }

    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 1);
    }

    {
      const response = await request(app).post('/auth/register').send(registerDto);
      assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.ok(response.text.includes(`duplicate`));
    }
  });

  it.skip('should correctly add', async () => {
    const response = await request(app).get('/auth/login');
    assert.equal(response.status, StatusCodes.OK);
    assert.equal(response.text, 'are equal');

    // const [, count] = await userRepository.findAndCount();
    // assert.equal(count, 1);
  });
});
