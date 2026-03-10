import { expect } from 'chai';
import { encrypt, decrypt } from '../../src/utils/encryption.js';

describe('Encryption Utility', () => {
  const plainText = 'sensitive@example.com';

  it('should encrypt a string', () => {
    const encrypted = encrypt(plainText);
    expect(encrypted).to.not.equal(plainText);
    expect(encrypted).to.be.a('string');
    expect(encrypted).to.have.lengthOf.at.least(32);
  });

  it('should decrypt an encrypted string back to original', () => {
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    expect(decrypted).to.equal(plainText);
  });

  it('should return same value if input is empty', () => {
    expect(encrypt('')).to.equal('');
    expect(decrypt('')).to.equal('');
  });

  it('should handle decryption of non-hex strings gracefully', () => {
    const result = decrypt('not-a-hex-string');
    expect(result).to.equal('not-a-hex-string');
  });
});
