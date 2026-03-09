import bcrypt, { compare } from 'bcrypt';

const SALT_ROUNDS = 10;

export const passwordUtil = {
  hash: (plainText: string) => {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  },

  compare: (plainText: string, hashed: string) => {
    return bcrypt.compare(plainText, hashed);
  }
}