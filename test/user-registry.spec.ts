/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable max-statements */

/* eslint-disable no-magic-numbers */

/* eslint-disable max-lines-per-function */
import { ApplicationService, container } from '#application/index.js';
import AppDataSource from '#database/data-source.js';
import { RegisterDto, User } from '#features/auth/index.js';
import { Logger, Mailer, TYPES } from '#features/common/index.js';
import { assert as assertChai } from 'chai';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ZodIssue } from 'zod';

const MutedLoggerService = {
  error: mock.fn(),
  info: mock.fn(),
} satisfies Logger;

const MailerService = {
  send: mock.fn(() => {}),
} satisfies Mailer;

const resetCalls = () => {
  MutedLoggerService.error.mock.resetCalls();
  MutedLoggerService.info.mock.resetCalls();
  MailerService.send.mock.resetCalls();
};

let userRepository: Repository<User>;
let application: ApplicationService;

describe('User', () => {
  before(async () => {
    container.rebind<Logger>(TYPES.Logger).toConstantValue(MutedLoggerService);
    container.rebind<Mailer>(TYPES.Mailer).toConstantValue(MailerService);
    application = await container.getAsync<ApplicationService>(ApplicationService);
    userRepository = AppDataSource.getRepository(User);
  });

  after(async () => {
    await application.destroy();
  });

  beforeEach(() => {
    userRepository.clear();
    resetCalls();
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
    const registerDto: RegisterDto = {
      email: 'john.smith+1@gmail.com',
      password: 'john.smith.123',
    };

    const register = async () => {
      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 0);
      }

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.CREATED);
      }
    };

    it('should correctly register and login', async () => {
      await register();

      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 1);
        assert.equal(MailerService.send.mock.calls.length, 1);
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
      await register();

      {
        const [[user], count] = await userRepository.findAndCount();
        assert.equal(count, 1);
        assert.notEqual(user.confirmationToken, 0);
        assertChai.include(user, { confirmed: false, email: registerDto.email });
        assert.equal(MailerService.send.mock.calls.length, 1);
        // assert.equal(sendMock.mock.calls.length, 1);
        // assert.equal(sendMock.mock.calls[0].arguments[0], user.confirmationToken);
      }

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
        assert.ok(response.body.message.includes(`duplicate`));
      }
    });
  });
});
