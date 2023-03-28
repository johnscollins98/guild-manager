import crypto from 'crypto';
import { Service } from 'typedi';
import { config } from '../../config';

@Service()
export class SymmetricEncryption {
  private readonly key: Buffer;
  private readonly algorithm: string = 'aes256';
  private readonly inputEncoding: crypto.Encoding = 'utf-8';
  private readonly outputEncoding: crypto.Encoding = 'hex';
  private readonly ivLength: number = 16;

  constructor() {
    this.key = Buffer.from(config.accessTokenEncryptionKey, 'latin1');
  }

  encrypt(valueToEncrypt: string) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let ciphered = cipher.update(valueToEncrypt, this.inputEncoding, this.outputEncoding);
    ciphered += cipher.final(this.outputEncoding);
    return iv.toString(this.outputEncoding) + ':' + ciphered;
  }

  decrypt(valueToDecrypt: string) {
    const components = valueToDecrypt.split(':');
    const iv_string = components.shift();
    if (iv_string === undefined) throw new Error('Unrecognised Access Token Format');

    const iv_from_ciphertext = Buffer.from(iv_string, this.outputEncoding);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv_from_ciphertext);
    let deciphered = decipher.update(components.join(':'), this.outputEncoding, this.inputEncoding);
    deciphered += decipher.final(this.inputEncoding);

    return deciphered;
  }
}
