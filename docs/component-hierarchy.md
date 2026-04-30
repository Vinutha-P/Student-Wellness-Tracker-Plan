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

- Current version uses React Router route-based navigation:
  - `/login`
  - `/dashboard`
  - `/plans`
  - `/logs`
  - `/appointments`
  - `/slots`
- Tabs are route links (`NavLink`) to route-based pages.
- Global state inside `App.jsx`:
  - auth/token state
  - dashboard data state (`plans`, `logs`, `slots`, `appointments`, `summary`)
  - page form state (`planForm`, `logForm`, `slotForm`, `appointmentForm`)
- API communication via Axios and Bearer token headers.
