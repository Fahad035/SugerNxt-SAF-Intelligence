# SugerNxt-SAF-Intelligence

SugerNxt-SAF-Intelligence is a full‑stack web application for **Sustainable Aviation Fuel (SAF) yield prediction and decision support** using a machine‑learning model served via a FastAPI backend and a React (Vite) frontend.

The project includes:
- **Backend (FastAPI + ML model)**: Authentication (signup/login), JWT-based protected routes, and a `/predict` endpoint that returns SAF yield predictions.
- **Frontend (React + Vite + Tailwind)**: A dashboard-style UI with pages for SAF insights such as process inputs, financial analysis, strategy, digital twin, and news.

---

## Repository structure

```text
.
├── README.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── saf_model.pkl
│   ├── saf_dataset.csv
│   ├── train_model.py
│   ├── generate_data.py
│   ├── runtime.txt
│   └── .python-version
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── public/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── Pages/
        │   ├── LandingPage.jsx
        │   ├── Dashboard.jsx
        │   ├── SugarProcess.jsx
        │   ├── SugarNews.jsx
        │   ├── DigitalTwin.jsx
        │   ├── FinancialPage.jsx
        │   ├── StrategyPage.jsx
        │   └── AuthPage.jsx
        ├── Components/
        └── utils/
            ├── authSession.js
            └── safCalculations.js
```

---

## Tech stack

### Frontend
- React (Vite)
- react-router-dom (routing)
- axios (API requests)
- Tailwind CSS (styling)
- recharts (charts/visualizations)

Frontend scripts (from `frontend/package.json`):
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

### Backend
- FastAPI
- Uvicorn
- NumPy, Pandas
- Scikit-learn (model training/inference)
- Joblib (load `.pkl` model)

---

## Features

### Authentication (Backend)
The backend provides a simple authentication system backed by **SQLite** (`backend/users.db`) and JWT tokens:

- `POST /auth/signup` — create account and receive token
- `POST /auth/login` — login and receive token
- `GET /auth/me` — returns current user (requires `Authorization: Bearer <token>`)

JWT is generated/validated server-side and stored client-side in browser storage by the frontend session helpers.

### Prediction API (Backend)
- `POST /predict` — predicts SAF output using the pre-trained model file:
  - Model file: `backend/saf_model.pkl`
  - Returns: `{ "predicted_saf": <number> }`

**Model input fields** (request body):
- `molasses_ton` (float)
- `fermentation_eff` (float)
- `dehydration_eff` (float)
- `atj_eff` (float)
- `energy_input` (float)
- `ethanol_liters` (float)

### Frontend pages (UI)
The app uses React Router and includes:
- Public:
  - `/` — Landing page
  - `/login` — Login screen
  - `/signup` — Signup screen
- Protected (requires login):
  - `/dashboard`
  - `/sugar-process`
  - `/sugar-news`
  - `/digital-twin`
  - `/financial`
  - `/strategy`

Route protection is handled by checking whether the user is authenticated in the browser session.

### Scenario & financial utilities (Frontend)
The frontend includes calculation helpers in `frontend/src/utils/safCalculations.js`, including:
- Scenario presets (Conservative/Base/Aggressive)
- Payload preparation (`preparePayload`)
- Estimated SAF calculations (local estimate)
- Derived outputs like carbon savings, ROI, revenue and costs, sensitivity datasets for charts

---

## Environment variables

### Frontend (`frontend/.env`)
Create a `.env` file in `frontend/` based on `.env.example`.

From `frontend/.env.example`:
```env
# Example: https://your-render-service-name.onrender.com
VITE_API_BASE_URL=https://sugernxt-saf-intelligence-1.onrender.com
```

`VITE_API_BASE_URL` should point to the FastAPI backend base URL.

### Backend (recommended)
The backend reads several environment variables (with defaults):

- `JWT_SECRET`  
  Default: `change-this-secret-in-production`  
  Set a strong secret in production.

- `JWT_EXP_MINUTES`  
  Default: `10080` (7 days)

- `ALLOWED_ORIGINS`  
  Comma-separated list of allowed origins for CORS.  
  If not provided, defaults to:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

- `ALLOWED_ORIGIN_REGEX`  
  Optional regex for allowed origins (used when `*` is not in allowed origins).  
  Default: allows `https://*.vercel.app`

---

## Local development setup

### 1) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# activate venv (Windows): .venv\Scripts\activate
# activate venv (macOS/Linux): source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend should be available at:
- `http://127.0.0.1:8000`
- Health check: `GET /` → `{"message":"Backend running"}`

### 2) Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend typically runs at:
- `http://localhost:5173`

Make sure `VITE_API_BASE_URL` points to your backend (local example):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## API usage examples

### Signup
```bash
curl -X POST http://127.0.0.1:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "company": "SugerNxt",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Predict SAF
```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "molasses_ton": 200,
    "fermentation_eff": 0.9,
    "dehydration_eff": 0.95,
    "atj_eff": 0.7,
    "energy_input": 1000,
    "ethanol_liters": 48000
  }'
```

---

## Notes / Production guidance

- Replace `JWT_SECRET` in production.
- Configure CORS via `ALLOWED_ORIGINS` to include your deployed frontend domain.
- The repository contains a pre-trained model (`saf_model.pkl`) and dataset (`saf_dataset.csv`). If you retrain the model, ensure the backend loads the updated model file.

---

## License
Add a license file and update this section if you plan to open-source the project.
