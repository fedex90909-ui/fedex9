# Netlify Functions — backend seam

The demo front end currently persists users, shipments, tracking events and
payments in the browser through the service layer in `src/services/`. Every
service call already verifies the session and role before touching data, which
mirrors what the server must do.

This directory is where the real backend lands. Planned endpoints (Phase 3):

| Endpoint                  | Method | Auth        | Purpose                                  |
| ------------------------- | ------ | ----------- | ---------------------------------------- |
| `/api/auth/signup`        | POST   | public      | Create account (hash password server-side) |
| `/api/auth/signin`        | POST   | public      | Issue signed session token (JWT)         |
| `/api/shipments`          | GET    | user token  | List **only the caller's** shipments     |
| `/api/shipments`          | POST   | user token  | Create shipment                          |
| `/api/shipments/:id`      | GET    | user token  | Fetch one shipment (owner or admin)      |
| `/api/shipments/:id`      | PATCH  | **admin**   | Update status / add tracking event       |
| `/api/payments`           | GET    | user token  | List caller's payments (admin: all)      |
| `/api/payments/:id`       | PATCH  | **admin**   | Change payment status (pending → paid…)  |
| `/api/users`              | GET    | **admin**   | List users                               |
| `/api/users/:id/role`     | PATCH  | **admin**   | Change role (never self)                 |

Reference implementation pattern (Node 20+, no extra deps needed for the shape):

```js
// netlify/functions/shipments.js  (planned)
import { verifyToken, requireRole } from './shared/auth.js'

export default async (req, context) => {
  const session = verifyToken(req.headers.get('authorization')) // throws 401
  if (req.method === 'PATCH') {
    requireRole(session, 'admin')                              // throws 403
    // …write to DATABASE_URL via @neondatabase/serverless…
  }
  // users only ever receive rows where user_id = session.userId
}
```

Rules carried over from the demo:

- Passwords are stored as PBKDF2 hashes (never plaintext).
- Role checks happen **server-side**; the frontend guard is only UX.
- Customers can only ever read their own shipments/payments.
- Secrets (`DATABASE_URL`, `AUTH_SECRET`, `PAYMENTS_SECRET_KEY`) live in
  Netlify environment variables — never in the repo.
