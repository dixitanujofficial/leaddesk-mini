# LeadDesk Mini

LeadDesk Mini is a small lead-capture product with a public form and a protected admin workspace. It uses React + Vite on the client and Express, MongoDB, Mongoose, bcrypt, and JWT on the server.

## Live deployment

- **Frontend:** https://leaddesk-mini-rose.vercel.app/
- **Backend API:** https://leaddesk-mini-hsd4.onrender.com/api

**Test credentials for reviewers:** use the admin email/password that were seeded for this deployment (see `ADMIN_EMAIL` / `ADMIN_PASSWORD` provided separately with this submission — not committed to the repo for security). Log in at `/admin/login` on the live frontend URL above.

Note: the backend is on Render's free tier, which sleeps after inactivity — the first request after a period of idle time may take 20-30 seconds to respond while it wakes up.

## Project structure

```text
client/   React + Vite application
server/   Express API, Mongoose models, authentication, and seed script
```

## Data model

### Lead

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | Required, trimmed, max 100 characters |
| `email` | String | Required, lowercased, email-validated |
| `budgetRange` | String | Required selection from the public form |
| `message` | String | Required, trimmed, max 2,000 characters |
| `status` | String | `New`, `Contacted`, or `Closed`; defaults to `New` |
| `createdAt` | Date | Added by Mongoose timestamps |

### Admin

| Field | Type | Notes |
| --- | --- | --- |
| `email` | String | Required and unique |
| `passwordHash` | String | bcrypt hash only; never stores a plaintext password |

## Authentication approach

The seed script creates the admin record using `ADMIN_EMAIL` and `ADMIN_PASSWORD`, hashing the password with bcrypt. On login, the API looks up the admin in MongoDB before comparing bcrypt hashes. A successful login returns a signed JWT. Protected lead endpoints require `Authorization: Bearer <token>`; the middleware verifies the JWT and confirms that its admin still exists in the database. Missing, invalid, or expired tokens receive a `401` response.

## Run locally

Prerequisites: Node.js 20+ and a MongoDB Atlas free-tier database (or a local MongoDB instance).

1. Install packages.

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Create `server/.env` from `server/.env.example`.

   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=use-a-long-random-secret
   JWT_EXPIRES_IN=1d
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=change-this-password
   CLIENT_URL=http://localhost:5173
   ```

3. Create `client/.env` from `client/.env.example`.

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Seed the admin account once (safe to rerun to update its password).

   ```bash
   cd server
   npm run seed:admin
   ```

5. In separate terminals, run the API and client.

   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```

Open `http://localhost:5173`, then log in at `http://localhost:5173/admin/login` with the seeded credentials.

## API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public, rate-limited | Admin login |
| `POST` | `/api/leads` | Public | Submit a lead |
| `GET` | `/api/leads?search=...` | Admin JWT | List/search leads |
| `PATCH` | `/api/leads/:id/status` | Admin JWT | Change a lead status |

## Deploy to Render (API)

1. Push this repository to GitHub.
2. In MongoDB Atlas, create an M0 free cluster. Add a database user and add `0.0.0.0/0` to Network Access for Render connectivity. Copy the connection string and replace its password.
3. In [Render](https://render.com), select **New → Web Service**, connect the GitHub repository, and set:

   | Setting | Value |
   | --- | --- |
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

4. Add these Render environment variables:

   | Variable | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A long, unique random secret |
   | `JWT_EXPIRES_IN` | `1d` |
   | `CLIENT_URL` | Set this to the Vercel URL after the client is deployed |

   `ADMIN_EMAIL` and `ADMIN_PASSWORD` are needed only when running the seed command. They do not need to remain as Render service variables afterward.

5. Deploy. Verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health` returns `{ "status": "ok" }`.
6. Seed the production admin once using the same `MONGO_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` locally: run `npm run seed:admin` from `server`. This writes to the same Atlas database that Render uses.

## Deploy to Vercel (client)

1. In [Vercel](https://vercel.com), select **Add New → Project** and import the GitHub repository.
2. Set **Root Directory** to `client`. Vercel will detect Vite; use:

   | Setting | Value |
   | --- | --- |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. Add this environment variable:

   | Variable | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://YOUR-RENDER-SERVICE.onrender.com/api` |

4. Deploy and copy the final Vercel URL.
5. Return to Render and set `CLIENT_URL` to that exact Vercel URL (no trailing slash), then redeploy the Render service.

## CORS

The API uses the `CLIENT_URL` environment variable as an allow-list. It accepts the Vercel frontend URL and `http://localhost:5173` for local development. Requests from any other browser origin are rejected, while direct non-browser health checks remain usable.

## Free-tier notes

MongoDB Atlas M0, Render free web services, and Vercel’s free tier are sufficient for this task. Render free services may take a short time to wake after inactivity.

## AI usage

I used AI assistance to scaffold the initial project structure, Mongoose models, Express routes, and middleware boilerplate. From there, I reviewed and worked through the implementation myself: verifying the auth flow (JWT issuance, token verification, admin re-lookup on every protected request), the CORS allow-list configuration, adding rate limiting to the login route, and the regex-escaping on the admin search query to prevent regex injection. I also debugged and fixed two real issues that only surfaced during deployment (see below) rather than accepting the first generated version as final.

## Known tradeoffs

- **JWT is stored in `localStorage`** on the client rather than an httpOnly cookie. This is simpler to implement for this scope, but is more exposed to XSS-based token theft than a cookie-based approach would be. For a production deployment handling real client data, I'd move to httpOnly cookies with a CSRF mitigation strategy instead.
- **MongoDB Atlas Network Access is set to `0.0.0.0/0`** (allow from anywhere) to keep Render connectivity simple within the task's time window. In production this would be scoped to Render's specific outbound IP ranges instead.
- **No automated tests** were added given the time constraints of this task; validation was done manually across the full flow (form submission, admin login, search, status updates) in both local and deployed environments.

## Bugs fixed during deployment

- **Header-merging bug in the frontend API client:** the shared `request()` helper in `client/src/api/api.js` spread `...options` after the `headers` object, so any call that passed custom headers (like the JWT `Authorization` header) silently overwrote `Content-Type: application/json` entirely. This caused the backend's `express.json()` middleware to never parse the request body, producing a `Cannot destructure property 'status' of req.body` crash on the status-update endpoint. Fixed by extracting `headers` from `options` first and merging it last, so `Content-Type` is never dropped.
- **404 on direct admin route loads on Vercel:** the app uses client-side routing (`BrowserRouter`), but Vercel has no knowledge of client-side routes and returns a 404 when a route like `/admin/login` is requested directly instead of navigated to from within the app. Fixed by adding a `client/vercel.json` rewrite rule that serves `index.html` for all paths, letting React Router handle routing client-side as intended.
- **MongoDB SRV DNS resolution failures in local development:** Node's internal DNS resolver failed to resolve the `mongodb+srv://` SRV record on the local dev network even though the OS-level resolver worked fine. Fixed by explicitly setting Node's DNS servers (`dns.setServers(["8.8.8.8", "8.8.4.4"])`) at the top of both `server.js` and `seedAdmin.js`, before any other imports run.