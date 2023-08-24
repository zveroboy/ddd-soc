export interface Mailer {
  send(from: string, to: string, subject: string, body: string): void;
}
