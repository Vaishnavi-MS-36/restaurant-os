# Deployment Guide

Backend + PostgreSQL on **Render**, frontend on **Vercel**. Both have free tiers, no credit card required for the basics.

## 1. Database — Render PostgreSQL

1. Go to https://dashboard.render.com → **New** → **PostgreSQL**
2. Name it `restaurantos-db`, choose the free plan, create it
3. Once created, copy the **Internal Database URL** (you'll use this for the backend, since it's in the same Render network) — or the **External Database URL** if connecting from elsewhere

## 2. Backend — Render Web Service

1. **New** → **Web Service** → connect your GitHub repo (`restaurant-os`)
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker (Render will detect `backend/Dockerfile`)
   - **Instance type:** Free
3. Environment variables (Render dashboard → Environment):
   ```
   DATABASE_URL   = <the Internal Database URL from step 1>
   SECRET_KEY     = <generate a random 32+ character string>
   GEMINI_API_KEY = <your Gemini API key>
   CORS_ORIGINS   = https://<your-vercel-app>.vercel.app
   ```
   (You can leave `CORS_ORIGINS` as `http://localhost:5173` for now and update it after you deploy the frontend and know its URL.)
4. Deploy. The Dockerfile's `CMD` runs `alembic upgrade head`, seeds demo data, then starts uvicorn — so migrations and demo users are created automatically on first boot.
5. Once live, verify:
   - `https://<your-backend>.onrender.com/` → `{"status": "RestaurantOS API is running"}`
   - `https://<your-backend>.onrender.com/docs` → interactive API docs

> Free-tier Render services spin down after inactivity and take ~30–60s to wake on the next request — mention this in your submission notes so reviewers aren't confused by a slow first load.

## 3. Frontend — Vercel

1. Go to https://vercel.com/new → import the `restaurant-os` GitHub repo
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Environment variable:
   ```
   VITE_API_URL = https://<your-backend>.onrender.com
   ```
4. Deploy. Vercel gives you a URL like `https://restaurant-os-xyz.vercel.app`

## 4. Connect the two

1. Copy the Vercel URL
2. Back in Render → your backend service → Environment → update:
   ```
   CORS_ORIGINS = https://<your-vercel-app>.vercel.app
   ```
3. Redeploy the backend (Render redeploys automatically on env var change, or click **Manual Deploy**)
4. Visit your Vercel URL, log in with a seeded demo account (see README), and confirm data loads

## Alternative: Railway (single platform for both + DB)

If you'd rather deploy everything from one dashboard:

1. https://railway.app/new → **Deploy from GitHub repo**
2. Add a **PostgreSQL** plugin — Railway injects `DATABASE_URL` automatically
3. Add two services from the same repo, pointing at `backend/Dockerfile` and `frontend/Dockerfile` respectively (set root directories accordingly)
4. Set `SECRET_KEY`, `GEMINI_API_KEY` on the backend service, and `VITE_API_URL` (pointing at the backend's Railway public URL) on the frontend service
5. Railway assigns public URLs to both automatically under **Settings → Networking → Generate Domain**

## Local Docker Compose (for testing before you deploy)

```bash
cp .env.example .env   # set SECRET_KEY, GEMINI_API_KEY
docker compose up --build
```
Confirms your Dockerfiles work before trusting them to a cloud platform — worth doing first if you're short on time.

## After deploying

Update the root `README.md`:
- Add the live frontend URL under **Deployment → Live demo**
- Add the live backend `/docs` URL
