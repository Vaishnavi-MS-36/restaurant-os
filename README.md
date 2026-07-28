# RestaurantOS — AI Powered Restaurant Management Platform

A full-stack restaurant management platform with role-based access control,
core restaurant/inventory/expense operations, an analytics dashboard, and
AI-powered features including invoice OCR extraction.

Built for the Full Stack Developer Technical Assessment.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React (Vite) + Tailwind CSS + React Router + Recharts + Axios |
| Backend  | FastAPI (Python) |
| Database | PostgreSQL + SQLAlchemy + Alembic migrations |
| Auth     | JWT (python-jose) + bcrypt password hashing |
| AI / OCR | Google Gemini (invoice extraction), rule-based stock prediction service |
| Exports  | openpyxl (Expense Register Excel export) |

## Features

### Authentication & RBAC
- JWT login/register
- Roles: `owner`, `manager`, `chef`, `waiter`, `cashier`, `store_manager`
- `require_role(...)` dependency enforces role checks on protected backend routes (e.g. invoice upload is Owner/Manager only)

### Core Modules
- **Tables** — create, list, update status
- **Orders** — create, list, view, mark complete
- **Menu** — categories + menu items (create/read/update/delete)
- **Recipes** — linked to menu items
- **Ingredients** — CRUD with stock levels and reorder thresholds
- **Suppliers** — CRUD
- **Purchase Orders** — create, list, receive (updates stock)
- **Expenses** — categories + expense records

### Dashboard
`/dashboard/*` endpoints power: sales overview, active orders, table occupancy,
low-stock items, monthly expenses, purchase summary, and supplier summary.

### AI Features
- `/ai/stock-predictions` — predicts ingredients likely to run low and suggests reorder quantities, based on consumption vs. current stock/threshold.

### AI Invoice Processing
- `POST /invoices/upload` — upload a printed or handwritten supplier invoice (PDF/image); Gemini extracts structured line-item data, which is stored in PostgreSQL
- `GET /invoices/` — list all processed invoices with extracted data
- `GET /invoices/export/expense-register` — generates and downloads an Excel Expense Register from all successfully extracted invoices

## Project Structure

```
restaurant-os/
├── backend/            FastAPI app
│   ├── app/
│   │   ├── api/        route modules (auth, menu, orders, invoices, ai, ...)
│   │   ├── core/       config, security, RBAC dependency
│   │   ├── db/         SQLAlchemy session/base
│   │   ├── models/     ORM models
│   │   ├── schemas/    Pydantic schemas
│   │   ├── services/   OCR + AI logic
│   │   └── scripts/    seed.py — demo users & sample data
│   ├── alembic/        migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           React (Vite) app
│   ├── src/
│   │   ├── api/        axios client
│   │   ├── pages/       Dashboard, Orders, Menu, Ingredients, Suppliers, Expenses, Insights, Tables, etc.
│   │   └── components/
│   └── Dockerfile
└── docker-compose.yml   Postgres + backend + frontend, one command
```

## Running Locally (without Docker)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL running locally (or a hosted instance)
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey)) for invoice OCR

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env with your DATABASE_URL, SECRET_KEY, GEMINI_API_KEY

alembic upgrade head             # run migrations
python -m app.scripts.seed       # create demo users + sample data
uvicorn app.main:app --reload    # http://localhost:8000
```

API docs available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env             # set VITE_API_URL=http://localhost:8000
npm run dev                      # http://localhost:5173
```

## Running with Docker Compose (recommended)

This spins up Postgres, the backend (with migrations + seeding run automatically), and the frontend in one command.

```bash
cp .env.example .env
# edit .env: set SECRET_KEY and GEMINI_API_KEY

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Default Login Credentials (seeded demo accounts)

Password for **all** accounts: `Passw0rd!`

| Role          | Email                        |
|---------------|-------------------------------|
| Owner         | owner@restaurantos.dev        |
| Manager       | manager@restaurantos.dev      |
| Chef          | chef@restaurantos.dev         |
| Waiter        | waiter@restaurantos.dev       |
| Cashier       | cashier@restaurantos.dev      |
| Store Manager | store@restaurantos.dev        |

Seeding also creates 8 sample tables, 2 menu categories with 4 menu items, and 4 ingredients (some below their reorder threshold, to demonstrate the low-stock and AI stock-prediction features immediately).

## Testing AI Invoice Processing

1. Log in as `owner@restaurantos.dev` or `manager@restaurantos.dev` (upload is restricted to these roles)
2. Go to the Expenses / Invoices section
3. Upload one of the sample invoices provided in the assessment ZIP (printed or handwritten)
4. Extracted fields appear in the invoice list once processing completes
5. Use "Export Expense Register" to download the Excel summary

## Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions to deploy the backend + Postgres on Render and the frontend on Vercel.

- **Live demo:** _add URL here after deploying_
- **API docs (deployed):** `<backend-url>/docs`

## Known Limitations / Next Steps

- AI menu-pricing, prep-time estimation, and waste-analysis endpoints are planned but not yet in this build (only stock-prediction is implemented)
- Some frontend edit flows and a couple of modules (e.g. Staff, standalone Product/Warehouse pages) are still in progress
- Automated tests are not yet included

