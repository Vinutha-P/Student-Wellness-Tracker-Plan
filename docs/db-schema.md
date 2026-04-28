# Database Schema

## auth-service (`auth.db`)

### `users`
- `id` INTEGER PK
- `name` TEXT NOT NULL
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL
- `role` TEXT CHECK IN (`student`, `counselor`, `admin`)
- `created_at` TEXT default current timestamp

## wellness-service (`wellness.db`)

### `wellness_plans`
- `id` INTEGER PK
- `student_id` INTEGER NOT NULL
- `title` TEXT NOT NULL
- `category` TEXT NOT NULL
- `target_value` INTEGER NOT NULL
- `unit` TEXT NOT NULL
- `start_date` TEXT NOT NULL
- `end_date` TEXT NOT NULL
- `status` TEXT default `active`
- `created_at` TEXT default current timestamp

### `wellness_logs`
- `id` INTEGER PK
- `plan_id` INTEGER NOT NULL (FK -> `wellness_plans.id`)
- `student_id` INTEGER NOT NULL
- `log_date` TEXT NOT NULL
- `mood_score` INTEGER
- `sleep_hours` REAL
- `water_liters` REAL
- `exercise_minutes` INTEGER
- `notes` TEXT
- `created_at` TEXT default current timestamp

## appointment-service (`appointments.db`)

### `counselor_slots`
- `id` INTEGER PK
- `counselor_id` INTEGER NOT NULL
- `slot_date` TEXT NOT NULL
- `start_time` TEXT NOT NULL
- `end_time` TEXT NOT NULL
- `mode` TEXT NOT NULL
- `is_available` INTEGER default 1

### `appointments`
- `id` INTEGER PK
- `slot_id` INTEGER NOT NULL (FK -> `counselor_slots.id`)
- `student_id` INTEGER NOT NULL
- `concern` TEXT NOT NULL
- `status` TEXT default `pending`
- `notes` TEXT
- `created_at` TEXT default current timestamp
- `updated_at` TEXT default current timestamp
