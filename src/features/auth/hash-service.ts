/* eslint-disable class-methods-use-this */

/* eslint-disable no-magic-numbers */
import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const randBytesAsync = promisify(randomBytes);
const pbkdf2Async = promisify(pbkdf2);

const saltBytes = 16;

const splitAt = (input: string, index: number): [string, string] => [input.slice(0, index), input.slice(index)];

export class HashingService {
  private static hexHash(data: string | Buffer, salt: string): Promise<string> {
    return pbkdf2Async(data, salt, 1000, 64, `sha512`).then((hash) => hash.toString('hex'));
  }

  static async hash(data: string | Buffer): Promise<string> {
    const hexSalt = await randBytesAsync(saltBytes).then((hash) => hash.toString('hex'));
    const hexHashedData = await HashingService.hexHash(data, hexSalt);

    return hexHashedData + hexSalt;
  }

  static async compare(data: string | Buffer, hexEncrypted: string): Promise<boolean> {
    const hexSaltStartIndex = saltBytes * 2;
    const [hexHashedData, hexSalt] = splitAt(hexEncrypted, -hexSaltStartIndex);
    const hashedData = await HashingService.hexHash(data, hexSalt);

    return hexHashedData === hashedData;
  }
}
