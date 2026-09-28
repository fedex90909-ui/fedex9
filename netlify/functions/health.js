/**
 * Netlify Function (v2): GET /api/health
 *
 * Liveness + configuration probe. The demo app stores data in the browser;
 * this function family is the seam where the real backend lands in Phase 3.
 * See netlify/functions/README.md for the full backend blueprint.
 */
export default async (req, context) => {
  return Response.json({
    ok: true,
    service: 'fedex-demo-api',
    time: new Date().toISOString(),
    integrations: {
      database: Boolean(process.env.DATABASE_URL),
      paymentsProvider: Boolean(process.env.PAYMENTS_SECRET_KEY),
    },
  })
}

export const config = { path: '/api/health' }
