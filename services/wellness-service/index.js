const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4002;
const JWT_SECRET = process.env.JWT_SECRET || "student-wellness-secret";
const db = new sqlite3.Database("./wellness.db");

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS wellness_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      unit TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS wellness_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      mood_score INTEGER,
      sleep_hours REAL,
      water_liters REAL,
      exercise_minutes INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(plan_id) REFERENCES wellness_plans(id)
    )
  `);
});

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

app.get("/health", (_req, res) => {
  res.json({ service: "wellness-service", status: "ok" });
});

app.get("/plans", auth, (req, res) => {
  const isStudent = req.user.role === "student";
  const studentId = isStudent ? req.user.id : req.query.studentId;
  const sql = studentId
    ? "SELECT * FROM wellness_plans WHERE student_id = ? ORDER BY created_at DESC"
    : "SELECT * FROM wellness_plans ORDER BY created_at DESC";
  const params = studentId ? [studentId] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch plans" });
    return res.json(rows);
  });
});

app.post("/plans", auth, allowRoles("student"), (req, res) => {
  const { title, category, targetValue, unit, startDate, endDate } = req.body;
  if (!title || !category || !targetValue || !unit || !startDate || !endDate) {
    return res.status(400).json({ error: "All fields are required" });
  }
  db.run(
    `INSERT INTO wellness_plans(student_id, title, category, target_value, unit, start_date, end_date)
     VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, title, category, targetValue, unit, startDate, endDate],
    function onInsert(err) {
      if (err) return res.status(500).json({ error: "Failed to create plan" });
      return res.status(201).json({ id: this.lastID });
    }
  );
});

app.put("/plans/:id", auth, allowRoles("student", "admin"), (req, res) => {
  const { id } = req.params;
  const { title, category, targetValue, unit, startDate, endDate, status } = req.body;
  db.get("SELECT * FROM wellness_plans WHERE id = ?", [id], (err, plan) => {
    if (err || !plan) return res.status(404).json({ error: "Plan not found" });
    if (req.user.role === "student" && plan.student_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    db.run(
      `UPDATE wellness_plans SET title=?, category=?, target_value=?, unit=?, start_date=?, end_date=?, status=?
       WHERE id=?`,
      [
        title ?? plan.title,
        category ?? plan.category,
        targetValue ?? plan.target_value,
        unit ?? plan.unit,
        startDate ?? plan.start_date,
        endDate ?? plan.end_date,
        status ?? plan.status,
        id,
      ],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ error: "Failed to update plan" });
        return res.json({ message: "Plan updated" });
      }
    );
  });
});

app.delete("/plans/:id", auth, allowRoles("student", "admin"), (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM wellness_plans WHERE id = ?", [id], (err, plan) => {
    if (err || !plan) return res.status(404).json({ error: "Plan not found" });
    if (req.user.role === "student" && plan.student_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    db.run("DELETE FROM wellness_plans WHERE id = ?", [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: "Failed to delete plan" });
      return res.json({ message: "Plan deleted" });
    });
  });
});

app.get("/logs", auth, (req, res) => {
  const sql =
    req.user.role === "student"
      ? "SELECT * FROM wellness_logs WHERE student_id = ? ORDER BY log_date DESC"
      : "SELECT * FROM wellness_logs ORDER BY log_date DESC";
  const params = req.user.role === "student" ? [req.user.id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch logs" });
    return res.json(rows);
  });
});

app.post("/logs", auth, allowRoles("student"), (req, res) => {
  const { planId, logDate, moodScore, sleepHours, waterLiters, exerciseMinutes, notes } = req.body;
  if (!planId || !logDate) return res.status(400).json({ error: "planId and logDate are required" });
  db.get("SELECT * FROM wellness_plans WHERE id = ?", [planId], (err, plan) => {
    if (err || !plan) return res.status(404).json({ error: "Plan not found" });
    if (plan.student_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    db.run(
      `INSERT INTO wellness_logs(plan_id, student_id, log_date, mood_score, sleep_hours, water_liters, exercise_minutes, notes)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [planId, req.user.id, logDate, moodScore, sleepHours, waterLiters, exerciseMinutes, notes],
      function onInsert(insertErr) {
        if (insertErr) return res.status(500).json({ error: "Failed to create log" });
        return res.status(201).json({ id: this.lastID });
      }
    );
  });
});

app.get("/dashboard/summary", auth, (req, res) => {
  const planSql =
    req.user.role === "student"
      ? "SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM wellness_plans WHERE student_id=?"
      : "SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM wellness_plans";
  const planParams = req.user.role === "student" ? [req.user.id] : [];
  db.get(planSql, planParams, (planErr, planStats) => {
    if (planErr) return res.status(500).json({ error: "Failed to fetch summary" });
    const logSql =
      req.user.role === "student"
        ? "SELECT COUNT(*) as totalLogs, ROUND(AVG(mood_score), 2) as avgMood FROM wellness_logs WHERE student_id=?"
        : "SELECT COUNT(*) as totalLogs, ROUND(AVG(mood_score), 2) as avgMood FROM wellness_logs";
    const logParams = req.user.role === "student" ? [req.user.id] : [];
    db.get(logSql, logParams, (logErr, logStats) => {
      if (logErr) return res.status(500).json({ error: "Failed to fetch summary" });
      return res.json({
        totalPlans: planStats.total || 0,
        activePlans: planStats.active || 0,
        totalLogs: logStats.totalLogs || 0,
        averageMood: logStats.avgMood || 0,
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`wellness-service listening on http://localhost:${PORT}`);
});
