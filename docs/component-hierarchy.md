# Frontend Component Hierarchy

```text
App
├── AuthView
│   ├── Login/Signup Toggle
│   └── AuthForm
└── DashboardView
    ├── Header
    ├── TabNav
    ├── StatusBanner
    ├── DashboardTab
    │   └── SummaryCard[]
    ├── PlansTab
    │   ├── PlanForm (student)
    │   └── PlanList
    ├── LogsTab
    │   ├── LogForm (student)
    │   └── LogList
    ├── SlotsTab
    │   ├── SlotForm (counselor/admin)
    │   └── SlotList
    └── AppointmentsTab
        ├── AppointmentForm (student)
        └── AppointmentList
```

## Routing and State

- Current version uses a single-page role-aware dashboard with tab navigation.
- Global state inside `App.jsx`:
  - auth/token state
  - dashboard data state (plans/logs/slots/appointments/summary)
  - tab-specific form state
- API communication via Axios and Bearer token headers.
