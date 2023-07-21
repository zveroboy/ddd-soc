/* eslint-disable max-statements */

/* eslint-disable no-magic-numbers */

/* eslint-disable max-lines-per-function */
import { Application } from '#application.js';
import { container } from '#bootstrap/index.js';
import AppDataSource from '#database/data-source.js';
import { RegisterDto, User } from '#features/auth/index.js';
import { Mailer, TYPES } from '#features/common/index.js';
import { assert as assertChai } from 'chai';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ZodIssue } from 'zod';

let userRepository: Repository<User>;
let application: Application;

describe('User', () => {
  before(async () => {
    application = await Application.create(container);
    userRepository = AppDataSource.getRepository(User);
  });

  after(async () => {
    await application.destroy();
  });

  beforeEach(() => {
    userRepository.clear();
  });

  // ([
  //   [{
  //     email: 'john.smith',
  //     password: 'john.smith.123',
  //   },]
  // ] as [Partial<RegisterDto>, ][]).forEach(() => )

  it.skip('should fail on invalid register input', async () => {
    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 0);
    }

    const registerDto: RegisterDto = {
      email: 'john.smith',
      password: 'john.smith.123',
    };

    {
      const response = await request(application.app).post('/auth/register').send(registerDto);
      assert.ok(response.body.issues.find((issue: ZodIssue) => issue.path[0] === 'email'));
      assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
    }
  });

  describe('Pass registration', () => {
    it.skip('should correctly register and login', async () => {
      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 0);
      }

      const registerDto: RegisterDto = {
        email: 'john.smith+1@gmail.com',
        password: 'john.smith.123',
      };

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.CREATED);
      }

      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 1);
      }

      {
        const response = await request(application.app)
          .post('/auth/login')
          .send({
            ...registerDto,
            password: 'wrong_password',
          });

        assert.equal(response.status, StatusCodes.FORBIDDEN);
      }

      {
        const response = await request(application.app)
          .post('/auth/login')
          .send({
            ...registerDto,
            email: 'wrong_email@gmail.com',
          });

        assert.equal(response.status, StatusCodes.FORBIDDEN);
      }

      {
        const response = await request(application.app).post('/auth/login').send({
          email: 'john.smith+1@gmail.com',
          password: 'john.smith.123',
        });

        assert.equal(response.status, StatusCodes.OK);
      }
    });

    it('should not allow register twice', async (ctx) => {
      const mailer = container.get<Mailer>(TYPES.Mailer);

      // mock.fn(() => Promise.resolve()),

      // const sum = mock.fn((message: string) => {});

      const sendMock = ctx.mock.method(mailer, 'send', (message: string) => null);

      // console.log({ mailer: mailer.send });

      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 0);
      }

      const registerDto: RegisterDto = {
        email: 'john.smith+1@gmail.com',
        password: 'john.smith.123',
      };

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.CREATED);

        const [[user], count] = await userRepository.findAndCount();
        assert.equal(count, 1);
        assertChai.isNotEmpty(user.confirmationToken);
        assertChai.include(user, { confirmed: false, email: registerDto.email });
        assert.equal(sendMock.mock.calls.length, 1);
        assert.equal(sendMock.mock.calls[0].arguments[0], user.confirmationToken);

        // assert.equal(mailer.send.mock, 0);
      }

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
        assert.ok(response.body.message.includes(`duplicate`));
      }
    });
  });
});
