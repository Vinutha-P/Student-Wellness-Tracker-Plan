# Test Case Checklist

## Authentication

- [ ] Signup with valid student credentials returns token
- [ ] Signup with duplicate email returns 409
- [ ] Login with valid credentials returns token
- [ ] Login with invalid password returns 401
- [ ] `/auth/me` with missing token returns 401

## Wellness Plan and Logs

- [ ] Student can create a plan
- [ ] Student sees only own plans
- [ ] Admin can view all plans
- [ ] Student can add log only for own plan
- [ ] Dashboard summary updates after log entry

## Slots and Appointments

- [ ] Counselor can create a slot
- [ ] Student can view available slots
- [ ] Student can request appointment
- [ ] Student overlapping appointment request returns 409
- [ ] Counselor can approve/reject own slot appointments
- [ ] Approved appointment marks slot unavailable
- [ ] Rejected/completed appointment reopens slot

## UI/Integration

- [ ] Login persists token in local storage
- [ ] Role-based tabs render correctly
- [ ] API error messages are shown in UI
- [ ] Dashboard reflects backend updates after action
