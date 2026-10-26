# Setup

Friendly Bill Book uses a local SQLite database. No PostgreSQL server is required.

1. Copy `backend/.env.example` to `backend/.env`.
2. Set a long random `JWT_SECRET` and a strong `ADMIN_PASSWORD`.
3. Install dependencies and start the project:

```powershell
npm install
npm run dev
```

The backend runs at `http://localhost:5000` and the frontend runs at `http://localhost:5173`. The SQLite database is created automatically under `backend/data/` when the backend starts.

For Netlify, set `VITE_API_URL` to the deployed backend API origin including `/api`, for example `https://api.example.com/api`.

Never commit or distribute `.env` files or a populated `backend/data/` directory containing business data.
