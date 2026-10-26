# Friendly Bill Book — deployment and security notes

## Important hosting limitation

Netlify hosts the React/Vite frontend in this repository. It does **not** run the Express backend in `backend/server.js` just because the frontend is deployed. The frontend requires a separately deployed API and persistent database for login, invoices, customers, stock, PDF generation, uploads, and the other data-backed features.

Deploy the backend to a Node.js host that supports a persistent disk, and make sure the SQLite database directory and uploaded files are stored on persistent storage with backups. A serverless/ephemeral filesystem is not suitable for this SQLite setup. Then set Netlify's environment variable `VITE_API_URL` to the backend origin (for example `https://your-api.example.com`, without `/api`; the app appends `/api`). Set the backend's `CORS_ORIGIN` to the exact Netlify site origin. Do not use wildcard CORS for an authenticated production API.

## Netlify frontend

- Build command: `npm run build`
- Publish directory: `dist/frontend`
- Node.js: use Node 22 or another version supported by the project's Vite version.
- Add `VITE_API_URL` in Netlify Site configuration → Environment variables.

## Backend environment

Create `backend/.env` on the backend host using `backend/.env.example` as a template. Set a unique, long random `JWT_SECRET`, a strong admin password, the correct `CORS_ORIGIN`, and an appropriate `PORT`/upload configuration. Never commit `.env` files or put backend secrets in `VITE_*` variables; Vite variables are public in the browser bundle.

## Credential exposure warning

The uploaded archive contained `backend/.env` with a JWT signing secret and an admin password. This prepared archive excludes that file, but removing it from an archive does not make previously exposed credentials safe. Rotate the JWT secret and admin password immediately on any live deployment where they were used. If the archive or repository was shared publicly, assume the values are compromised. Rotating the JWT secret invalidates existing login tokens, which is expected.

## Verification status

The source and deployment configuration were reviewed and the print/PDF download behavior received targeted fixes. A production build could **not** be verified in this environment because dependency installation did not complete and the build stopped with `vite: not found`. Do not treat this archive as production-certified until `npm ci` and `npm run build` pass and the app is tested against a deployed backend, including authentication, invoice save/edit/delete, PDF download, browser printing, uploads, and persistence after a server restart.
