# Student Wellness Tracker Plan

Student Wellness Tracker Plan is a full-stack microservice-based web application built with React and Node.js.
It helps students create wellness plans, submit daily wellness logs, and request counseling appointments.
Counselors and admins can manage slots, approve/reject appointments, and monitor usage.

## Tech Stack

- Frontend: React + Vite + Axios
- Backend: Node.js + Express (3 microservices)
- Persistence: SQLite per service
- Auth: JWT token-based role access

## Services

- `auth-service` (`http://localhost:4001`) - signup/login/token validation
- `wellness-service` (`http://localhost:4002`) - wellness plan and progress log CRUD
- `appointment-service` (`http://localhost:4003`) - counselor slots + appointment workflow
- `frontend` (`http://localhost:5173`) - role-based user interface

## Quick Start

1. Install dependencies:
   - `cd services/auth-service && npm install`
   - `cd services/wellness-service && npm install`
   - `cd services/appointment-service && npm install`
   - `cd frontend && npm install`
2. Start backend services in separate terminals:
   - `cd services/auth-service && npm start`
   - `cd services/wellness-service && npm start`
   - `cd services/appointment-service && npm start`
3. Start frontend:
   - `cd frontend && npm run dev`
4. Open `http://localhost:5173`

## Roles

- Student: manages personal plans/logs and books appointments
- Counselor: creates slots and manages student appointment status
- Admin: monitors all data and can perform counselor actions

## Deliverable Docs

Assignment-specific documentation is available in `docs/`:
- `architecture.md`
- `db-schema.md`
- `api-overview.md`
- `swagger/` (OpenAPI specs per service)
- `postman/student-wellness-tracker.postman_collection.json`
- `test-cases.md`
- `component-hierarchy.md`
- `demo-video-script.md`
- `screenshots.md`
- `ai-usage-log.md`
- `reflection-report.md`
