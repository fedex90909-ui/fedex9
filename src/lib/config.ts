/**
 * Runtime configuration. Values come from Vite env vars (VITE_*), which are
 * injected at build time — set them in Netlify → Site settings → Environment
 * variables for production, or in a local `.env` file for development.
 */
const raw = (import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@example.com') as string

/** Any of these emails is granted the admin role at registration or sign-in. */
export const ADMIN_EMAILS: string[] = raw
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export const APP_NAME = 'FedEx'
