/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable max-statements */

/* eslint-disable no-magic-numbers */

/* eslint-disable max-lines-per-function */
import { TYPES as APP_TYPES, EventBus, Logger } from '#application/index.js';
import { TYPES as DOMAIN_TYPES, RegisterDto, User, UserRepository } from '#domain/index.js';
import { ApplicationService, container } from '#infrastructure/index.js';
import { assert as assertChai } from 'chai';
import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, beforeEach, describe, it, mock } from 'node:test';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ZodIssue } from 'zod';

const MutedLoggerService = {
  error: mock.fn(),
  info: mock.fn(),
} satisfies Logger;

// const MailerService = {
//   send: mock.fn(() => {}),
// } satisfies Mailer;

const resetCalls = () => {
  MutedLoggerService.error.mock.resetCalls();
  MutedLoggerService.info.mock.resetCalls();
  // MailerService.send.mock.resetCalls();
};

let userRepository: Repository<User>;
let application: ApplicationService;

describe('User', () => {
  before(async () => {
    container.rebind<Logger>(APP_TYPES.Logger).toConstantValue(MutedLoggerService);
    // container.rebind<Mailer>(TYPES.Mailer).toConstantValue(MailerService);
    application = await container.getAsync<ApplicationService>(ApplicationService);
    userRepository = container.get<UserRepository>(DOMAIN_TYPES.UserRepository);
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

  it('should fail on invalid register input', async () => {
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

  const register = async (registerDto: RegisterDto) => {
    {
      const [, count] = await userRepository.findAndCount();
      assert.equal(count, 0);
    }

    {
      const response = await request(application.app).post('/auth/register').send(registerDto);
      assert.equal(response.status, StatusCodes.CREATED);
    }
  };

  describe('Pass registration', () => {
    const registerDto: RegisterDto = {
      email: 'john.smith+1@gmail.com',
      password: 'john.smith.123',
    };

    it('should correctly register and login', async (ctx) => {
      const eventBus = container.get<EventBus>(APP_TYPES.EventBus);
      const userRegisteredPromise = once(eventBus, 'user.registered');
      const mockedEmit = ctx.mock.method(eventBus, 'emit');
      await register(registerDto);
      await userRegisteredPromise;

      {
        const [, count] = await userRepository.findAndCount();
        assert.equal(count, 1);
        assert.equal(mockedEmit.mock.calls.length, 1);
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
        const response = await request(application.app).post('/auth/login').send(registerDto);

        assert.equal(response.status, StatusCodes.OK);
      }

      mockedEmit.mock.resetCalls();
    });

    it('should not allow register twice', async () => {
      await register(registerDto);

      {
        const [[user], count] = await userRepository.findAndCount();
        assert.equal(count, 1);
        assert.notEqual(user.confirmationToken, 0);
        assertChai.include(user, { confirmed: false, email: registerDto.email });
      }

      {
        const response = await request(application.app).post('/auth/register').send(registerDto);
        assert.equal(response.status, StatusCodes.UNPROCESSABLE_ENTITY);
        assert.ok(response.body.message.includes(`duplicate`));
      }
    });
  });

  describe.only('Confirm', () => {
    const eventBus = container.get<EventBus>(APP_TYPES.EventBus);

    it.only('should confirm user after registration', async () => {
      await register({
        email: 'john.smith+2@gmail.com',
        password: 'john.smith.123',
      });

      {
        const [[user]] = await userRepository.findAndCount();
        assert.ok(!user.confirmed);

        const userConfirmedPromise = once(eventBus, 'user.confirmed');
        const response = await request(application.app).post(`/auth/confirm/${user.confirmationToken}`).send({
          token: user.confirmationToken,
        });
        // await userConfirmedPromise;
        assert.equal(response.status, StatusCodes.OK);
      }

      {
        const [[user]] = await userRepository.findAndCount();
        assert.ok(user.confirmed);
      }
    });

    it("shouldn't confirm user with wrong token", async () => {
      await register({
        email: 'john.smith+2@gmail.com',
        password: 'john.smith.123',
      });

      {
        const [[user]] = await userRepository.findAndCount();
        assert.ok(!user.confirmed);

        const response = await request(application.app).post('/auth/confirm/wrong_wrong_wrong_wrong_wrong_wr').send({
          token: user.confirmationToken,
        });
        assert.equal(response.status, StatusCodes.NOT_FOUND);
      }
    });
  });
});
