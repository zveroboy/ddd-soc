import { injectable } from 'inversify';
import { SentMessageInfo, Transporter, createTransport } from 'nodemailer';

import { Mailer } from './mailer.js';

@injectable()
export class NodeMailer implements Mailer {
  private transporter: Transporter<SentMessageInfo>;

  constructor(host: string, port: number, secure: boolean, username: string, password: string) {
    this.transporter = createTransport({
      auth: {
        pass: password,
        user: username,
      },
      host,
      port,
      secure,
    });
  }

  send(): void {
    throw new Error('Method not implemented.');
  }
}
