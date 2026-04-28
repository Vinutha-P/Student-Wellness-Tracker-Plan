const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || "student-wellness-secret";
const db = new sqlite3.Database("./appointments.db");

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS counselor_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      counselor_id INTEGER NOT NULL,
      slot_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      mode TEXT NOT NULL,
      is_available INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      concern TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(slot_id) REFERENCES counselor_slots(id)
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
  res.json({ service: "appointment-service", status: "ok" });
});

app.get("/slots", auth, (req, res) => {
  const sql =
    req.user.role === "counselor"
      ? "SELECT * FROM counselor_slots WHERE counselor_id = ? ORDER BY slot_date, start_time"
      : "SELECT * FROM counselor_slots WHERE is_available = 1 ORDER BY slot_date, start_time";
  const params = req.user.role === "counselor" ? [req.user.id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch slots" });
    return res.json(rows);
  });
});

app.post("/slots", auth, allowRoles("counselor", "admin"), (req, res) => {
  const { slotDate, startTime, endTime, mode } = req.body;
  if (!slotDate || !startTime || !endTime || !mode) {
    return res.status(400).json({ error: "slotDate, startTime, endTime and mode are required" });
  }
  const counselorId = req.user.role === "counselor" ? req.user.id : Number(req.body.counselorId);
  if (!counselorId) return res.status(400).json({ error: "counselorId required for admin slot creation" });
  db.run(
    `INSERT INTO counselor_slots(counselor_id, slot_date, start_time, end_time, mode)
     VALUES(?, ?, ?, ?, ?)`,
    [counselorId, slotDate, startTime, endTime, mode],
    function onInsert(err) {
      if (err) return res.status(500).json({ error: "Failed to create slot" });
      return res.status(201).json({ id: this.lastID });
    }
  );
});

app.get("/appointments", auth, (req, res) => {
  let sql = `
    SELECT a.*, s.slot_date, s.start_time, s.end_time, s.mode, s.counselor_id
    FROM appointments a
    JOIN counselor_slots s ON a.slot_id = s.id
  `;
  const params = [];
  if (req.user.role === "student") {
    sql += " WHERE a.student_id = ?";
    params.push(req.user.id);
  } else if (req.user.role === "counselor") {
    sql += " WHERE s.counselor_id = ?";
    params.push(req.user.id);
  }
  sql += " ORDER BY s.slot_date, s.start_time";
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch appointments" });
    return res.json(rows);
  });
});

app.post("/appointments", auth, allowRoles("student"), (req, res) => {
  const { slotId, concern } = req.body;
  if (!slotId || !concern) return res.status(400).json({ error: "slotId and concern are required" });

  db.get("SELECT * FROM counselor_slots WHERE id = ? AND is_available = 1", [slotId], (slotErr, slot) => {
    if (slotErr || !slot) return res.status(404).json({ error: "Slot not available" });

    const overlapSql = `
      SELECT a.id FROM appointments a
      JOIN counselor_slots s ON s.id = a.slot_id
      WHERE a.student_id = ? AND a.status IN ('pending', 'approved')
        AND s.slot_date = ? AND NOT (s.end_time <= ? OR s.start_time >= ?)
    `;
    db.get(overlapSql, [req.user.id, slot.slot_date, slot.start_time, slot.end_time], (overlapErr, overlap) => {
      if (overlapErr) return res.status(500).json({ error: "Failed to validate slot overlap" });
      if (overlap) return res.status(409).json({ error: "You already have an overlapping appointment" });

      db.run(
        "INSERT INTO appointments(slot_id, student_id, concern) VALUES (?, ?, ?)",
        [slotId, req.user.id, concern],
        function onInsert(insertErr) {
          if (insertErr) return res.status(500).json({ error: "Failed to create appointment" });
          return res.status(201).json({ id: this.lastID });
        }
      );
    });
  });
});

app.patch("/appointments/:id/status", auth, allowRoles("counselor", "admin"), (req, res) => {
  const { status, notes } = req.body;
  const allowed = ["approved", "rejected", "completed"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const { id } = req.params;
  db.get(
    `SELECT a.id, s.counselor_id, s.id AS slot_id
     FROM appointments a JOIN counselor_slots s ON a.slot_id = s.id WHERE a.id = ?`,
    [id],
    (err, row) => {
      if (err || !row) return res.status(404).json({ error: "Appointment not found" });
      if (req.user.role === "counselor" && row.counselor_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      db.run(
        "UPDATE appointments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, notes || null, id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: "Failed to update appointment" });
          if (status === "approved") {
            db.run("UPDATE counselor_slots SET is_available = 0 WHERE id = ?", [row.slot_id]);
          }
          if (status === "rejected" || status === "completed") {
            db.run("UPDATE counselor_slots SET is_available = 1 WHERE id = ?", [row.slot_id]);
          }
          return res.json({ message: "Appointment status updated" });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`appointment-service listening on http://localhost:${PORT}`);
});
