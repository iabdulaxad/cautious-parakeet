# Hospital Management — Frontend

React + Vite + Tailwind frontend for the Hospital Management system. It talks to
the Go uCode FaaS backend through the `invoke_function` endpoint and ships role
based experiences for **Patients, Doctors, Receptionists and SuperAdmins**.

## Stack

- React 18 + React Router 7
- Vite 5, Tailwind CSS 3
- axios (API client), react-toastify (notifications)
- Custom auth (JWT access + refresh) — no extra state library

## Getting started

```bash
npm install
cp .env.example .env   # then edit values for your deployment
npm run dev            # http://localhost:5173
npm run build          # production build into dist/
npm run lint
```

## Environment

The app calls `POST {VITE_API_BASE_URL}/v2/invoke_function/{VITE_FUNCTION_SLUG}/?project-id={VITE_PROJECT_ID}`
with body `{"data":{"method":"...","object_data":{...}}}`. Configure it in `.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | uCode base URL (e.g. `https://api.admin.u-code.io`) |
| `VITE_FUNCTION_SLUG` | Deployed function slug (`matrix-hospital`) |
| `VITE_PROJECT_ID` | uCode project id |
| `VITE_ENVIRONMENT_ID` | uCode environment id (sent as the `environment-id` header) |
| `VITE_CURRENCY` | Currency label shown in the UI (default `UZS`) |

## Project structure

```
src/
  api/        client.js (axios + invoke + token refresh), methods.js (typed API)
  Context/    AuthContext (session/role), AppContext (specialities, currency)
  hooks/      useApi.js (useQuery / useMutation)
  layouts/    PublicLayout (navbar+footer), DashboardLayout (staff sidebar)
  routes/     ProtectedRoute (auth + role gate)
  ui/         shared kit (Button, Input, Table, Modal, Badge, StatCard, …)
  utils/      format.js (money/date/status), roles.js
  Component/  Navbar, Footer, DoctorCard and home sections
  Pages/      public + patient pages, plus doctor/, reception/, admin/ portals
```

## Auth & roles

- `Login` signs in (or self-registers a patient) and stores the JWT pair in
  `localStorage`. The access token is attached to every request; on a `401` the
  client transparently refreshes once, then logs out if that fails.
- `ProtectedRoute` gates patient pages and the staff portals. After login each
  role is routed to its home: Patient → `/`, Doctor → `/doctor`,
  Receptionist → `/reception`, SuperAdmin → `/admin`.

## Features by role

- **Public / Patient** — home, doctor catalog (filters + search), doctor detail
  with real available slots, booking, reviews; patient dashboard (appointments,
  prescriptions, invoices, medical history, profile, change password).
- **Doctor** — dashboard, weekly schedule editor, appointments with status
  updates, create medical records / prescriptions, patient lookup.
- **Receptionist** — register patients, manage appointments, walk-in booking,
  patient search, create & settle invoices.
- **SuperAdmin** — dashboard counts, staff management & onboarding, the eight
  reports, profit/loss, and expenses.
