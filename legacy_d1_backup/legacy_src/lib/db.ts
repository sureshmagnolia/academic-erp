import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB() {
  const ctx = getRequestContext();
  if (!ctx || !ctx.env || !ctx.env.DB) {
    throw new Error('Database binding not found in environment');
  }
  return ctx.env.DB;
}
