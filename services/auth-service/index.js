const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || "student-wellness-secret";
const db = new sqlite3.Database("./auth.db");

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'counselor', 'admin')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const issueToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

app.get("/health", (_req, res) => {
  res.json({ service: "auth-service", status: "ok" });
});

app.post("/auth/signup", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, and role are required" });
  }
  if (!["student", "counselor", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users(name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email.toLowerCase(), passwordHash, role],
    function onInsert(err) {
      if (err) {
        return res.status(409).json({ error: "Email already exists" });
      }
      const user = { id: this.lastID, name, email: email.toLowerCase(), role };
      const token = issueToken(user);
      return res.status(201).json({ token, user });
    }
  );
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  db.get(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email.toLowerCase()],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!bcrypt.compareSync(password, row.password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const user = { id: row.id, name: row.name, email: row.email, role: row.role };
      const token = issueToken(user);
      return res.json({ token, user });
    }
  );
});

app.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch (_error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`auth-service listening on http://localhost:${PORT}`);
});
