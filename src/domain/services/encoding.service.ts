/* eslint-disable class-methods-use-this */
import { bytesToHexLength } from '#shared/bytes.js';
import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const randBytesAsync = promisify(randomBytes);
const pbkdf2Async = promisify(pbkdf2);

const SALT_BYTES = 16;

// eslint-disable-next-line no-magic-numbers
const splitAt = (input: string, index: number): [string, string] => [input.slice(0, index), input.slice(index)];

export class EncodingService {
  private static async hexHash(data: string | Buffer, salt: string): Promise<string> {
    const iterations = 1000;
    const keyLength = 64;
    const hash = await pbkdf2Async(data, salt, iterations, keyLength, `sha512`);
    return hash.toString('hex');
  }

  static async generateBytes(length: number): Promise<string> {
    const hash = await randBytesAsync(length);
    return hash.toString('hex');
  }

  static async hash(data: string | Buffer): Promise<string> {
    const hexSalt = await EncodingService.generateBytes(SALT_BYTES);
    const hexHashedData = await EncodingService.hexHash(data, hexSalt);

    return hexHashedData + hexSalt;
  }

  static async compare(data: string | Buffer, hexEncrypted: string): Promise<boolean> {
    const hexSaltStartIndex = bytesToHexLength(SALT_BYTES);
    const [hexHashedData, hexSalt] = splitAt(hexEncrypted, -hexSaltStartIndex);
    const hashedData = await EncodingService.hexHash(data, hexSalt);

    return hexHashedData === hashedData;
  }
}
