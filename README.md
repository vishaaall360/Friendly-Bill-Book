# Friendly Bill Book

## Ownership

Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.

This repository contains the Friendly Bill Book business operations platform for managing billing, CRM, inventory, sales, purchases, payments, and reporting.

### Third-Party Software

This project uses third-party libraries and services. Those components remain subject to their respective licenses and terms. Refer to `NOTICE.md` and `COPYRIGHT.md` for detailed third-party information and license compliance details.

---

Friendly Bill Book is a standalone billing and business management application built for small and growing businesses.

## Project layout

- `frontend/`: React and Vite client application
- `backend/`: Node.js and Express API with SQLite persistence
- `uploads/`: user-uploaded business files and documents
- `generated/`: generated PDFs, invoices, quotations, and reports

## Deployment

Read [DEPLOYMENT-NOTES.md](DEPLOYMENT-NOTES.md) before deploying. Netlify serves the frontend only; the Express API and SQLite data need a separate persistent backend host.

## Setup

1. Copy the relevant `.env.example` files to local `.env` files and set secure values.
2. Ensure the backend has `backend/.env` configured with your local JWT and admin credentials.
3. Run `npm install` from the project root.

## Commands

- `npm run dev`: start the frontend and backend together
- `npm run client`: start the frontend
- `npm run server`: start the backend
- `npm run build`: create the frontend production build
- `npm run start`: start the backend in production mode
- `npm run lint`: lint the project source

## License

This software and its source code are proprietary to JB YOUR SAFE TECHNOLOGY. Third-party components remain subject to their respective licenses.

See `LICENSE`, `COPYRIGHT.md`, and `NOTICE.md` for detailed licensing information.
