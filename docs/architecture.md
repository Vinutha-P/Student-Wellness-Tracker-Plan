# Architecture Overview

## Problem Statement

Students need a single platform to:
- define personal wellness goals
- log daily progress (mood, sleep, hydration, exercise)
- book counseling appointments

Manual workflows make this difficult to track and scale for counselors/admins.

## Microservice Architecture

- `auth-service`: user identity and JWT token handling
- `wellness-service`: wellness plans and daily logs
- `appointment-service`: counselor slots and appointment lifecycle
- `frontend`: role-aware React application

The frontend calls each service directly over REST.

## Role-Based Access

- Student: create/update own plans, add logs, request appointments
- Counselor: create slots, approve/reject/complete appointments in own slots
- Admin: cross-role monitoring and scheduling support

## Integration Flow

1. User logs in through `auth-service`
2. JWT token is stored in frontend and passed as `Authorization: Bearer <token>`
3. Other services verify token and enforce role restrictions
4. UI updates by fetching data from all services
