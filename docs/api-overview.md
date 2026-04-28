# API Overview

All protected endpoints require:

`Authorization: Bearer <jwt>`

## auth-service (`http://localhost:4001`)

- `GET /health`
- `POST /auth/signup`
  - body: `name`, `email`, `password`, `role`
- `POST /auth/login`
  - body: `email`, `password`
- `GET /auth/me`

## wellness-service (`http://localhost:4002`)

- `GET /health`
- `GET /plans` (student: own plans; counselor/admin: all or by `studentId`)
- `POST /plans` (student)
- `PUT /plans/:id` (student owner or admin)
- `DELETE /plans/:id` (student owner or admin)
- `GET /logs` (student: own logs; counselor/admin: all)
- `POST /logs` (student)
- `GET /dashboard/summary`

## appointment-service (`http://localhost:4003`)

- `GET /health`
- `GET /slots`
- `POST /slots` (counselor/admin)
- `GET /appointments`
- `POST /appointments` (student)
- `PATCH /appointments/:id/status` (counselor/admin)
  - allowed status: `approved`, `rejected`, `completed`

## Validation Rules Implemented

- Required payload checks on all create/update endpoints
- Role-based authorization in each service
- Slot overlap prevention for student appointments
- Counselor ownership check for appointment status updates
