# Demo Video Script (Role-Based Workflow)

## Duration Target

6-8 minutes

## 1. Intro (45 sec)

- Introduce project: Student Wellness Tracker Plan
- Explain problem statement and users (student, counselor, admin)
- Mention React frontend + Node.js microservices + SQLite

## 2. Architecture (45 sec)

- Show service structure:
  - auth-service
  - wellness-service
  - appointment-service
- Show documentation files (`docs/architecture.md`, `docs/db-schema.md`, Swagger/Postman exports)

## 3. Student Flow (2 min)

- Signup/login as student
- Create wellness plan
- Add daily wellness log
- Open appointments tab and request a slot
- Show student-only view and data filtering

## 4. Counselor Flow (1.5 min)

- Login as counselor
- Create counseling slot
- Review pending appointment
- Approve appointment and add note

## 5. Admin Flow (1 min)

- Login as admin
- Show all data visibility
- Show ability to monitor plans/logs/appointments

## 6. Validation and Edge Case (45 sec)

- Trigger overlap booking from student account
- Show API/UI error handling

## 7. AI-Assisted Development Reflection (45 sec)

- Show `docs/ai-usage-log.md`
- Explain where AI accelerated work and where manual debugging was needed
- Mention code quality checks and lessons learned
