import crypto from 'node:crypto';
import { env } from '../config/env.js';

const VERSION = 'v1';

export function encryptSensitive(value?: string | null): string | null {
  if (!value) return null;
  if (!env.APP_ENCRYPTION_KEY) return value;
  const key = Buffer.from(env.APP_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptSensitive(value?: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith(`${VERSION}.`)) return value;
  if (!env.APP_ENCRYPTION_KEY) return null;
  const [, iv, tag, ciphertext] = value.split('.');
  if (!iv || !tag || !ciphertext) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(env.APP_ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
