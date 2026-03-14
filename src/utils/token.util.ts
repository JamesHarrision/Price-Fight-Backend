import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDate } from './day.util';

const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

export const tokenUtil = {
  generateOTP: (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  generateToken: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },

  signAccessToken: (payload: { id: string; role: string }): string => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
  },

  signRefreshToken: (payload: { id: string }): string => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  },

  getExpiresAt: (unit: 'hours' | 'days' | 'minutes', amount: number): Date => {
    const date = getDate();
    if (unit === 'minutes') date.setMinutes(date.getMinutes() + amount);
    if (unit === 'hours') date.setHours(date.getHours() + amount);
    if (unit === 'days') date.setDate(date.getDate() + amount);
    return date;
  },
};
