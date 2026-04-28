import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const AUTH_API = "http://localhost:4001";
const WELLNESS_API = "http://localhost:4002";
const APPOINTMENT_API = "http://localhost:4003";

const getAuthHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [planForm, setPlanForm] = useState({
    title: "",
    category: "mindfulness",
    targetValue: 5,
    unit: "sessions/week",
    startDate: "",
    endDate: "",
  });
  const [logForm, setLogForm] = useState({
    planId: "",
    logDate: "",
    moodScore: 3,
    sleepHours: 7,
    waterLiters: 2,
    exerciseMinutes: 30,
    notes: "",
  });
  const [slotForm, setSlotForm] = useState({
    slotDate: "",
    startTime: "",
    endTime: "",
    mode: "online",
  });
  const [appointmentForm, setAppointmentForm] = useState({ slotId: "", concern: "" });

  const isStudent = user?.role === "student";
  const isCounselor = user?.role === "counselor";
  const isAdmin = user?.role === "admin";

  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return ["dashboard", "plans", "logs", "appointments", "slots"];
  }, [user]);

  const clearMessages = () => {
    setStatusMessage("");
    setErrorMessage("");
  };

  const onAuthSubmit = async (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;
      const { data } = await axios.post(`${AUTH_API}${endpoint}`, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setStatusMessage(`Welcome, ${data.user.name}!`);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Authentication failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setPlans([]);
    setLogs([]);
    setSlots([]);
    setAppointments([]);
    setSummary(null);
  };

  const fetchDashboard = async () => {
    if (!token) return;
    const headers = getAuthHeaders(token);
    const [summaryResp, plansResp, logsResp, slotsResp, appointmentsResp] = await Promise.all([
      axios.get(`${WELLNESS_API}/dashboard/summary`, headers),
      axios.get(`${WELLNESS_API}/plans`, headers),
      axios.get(`${WELLNESS_API}/logs`, headers),
      axios.get(`${APPOINTMENT_API}/slots`, headers),
      axios.get(`${APPOINTMENT_API}/appointments`, headers),
    ]);
    setSummary(summaryResp.data);
    setPlans(plansResp.data);
    setLogs(logsResp.data);
    setSlots(slotsResp.data);
    setAppointments(appointmentsResp.data);
  };

  useEffect(() => {
    const loadData = async () => {
      clearMessages();
      if (!token) return;
      try {
        await fetchDashboard();
      } catch (error) {
        setErrorMessage(error.response?.data?.error || "Failed to load dashboard data");
      }
    };
    loadData();
  }, [token]);

  const createPlan = async (event) => {
    event.preventDefault();
    clearMessages();
    try {
      await axios.post(`${WELLNESS_API}/plans`, planForm, getAuthHeaders(token));
      setStatusMessage("Wellness plan created");
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to create plan");
    }
  };

  const createLog = async (event) => {
    event.preventDefault();
    clearMessages();
    try {
      await axios.post(`${WELLNESS_API}/logs`, logForm, getAuthHeaders(token));
      setStatusMessage("Progress log added");
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to add log");
    }
  };

  const createSlot = async (event) => {
    event.preventDefault();
    clearMessages();
    try {
      await axios.post(`${APPOINTMENT_API}/slots`, slotForm, getAuthHeaders(token));
      setStatusMessage("Counseling slot created");
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to create slot");
    }
  };

  const bookAppointment = async (event) => {
    event.preventDefault();
    clearMessages();
    try {
      await axios.post(`${APPOINTMENT_API}/appointments`, appointmentForm, getAuthHeaders(token));
      setStatusMessage("Appointment request submitted");
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to book appointment");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    clearMessages();
    try {
      await axios.patch(
        `${APPOINTMENT_API}/appointments/${appointmentId}/status`,
        { status },
        getAuthHeaders(token)
      );
      setStatusMessage(`Appointment ${status}`);
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to update appointment");
    }
  };

  if (!user) {
    return (
      <main className="container">
        <h1>Student Wellness Tracker Plan</h1>
        <p className="subtitle">Microservice-based platform for wellness plans and counseling appointments.</p>
        <form className="card form" onSubmit={onAuthSubmit}>
          <div className="row">
            <button type="button" onClick={() => setAuthMode("login")} className={authMode === "login" ? "active" : ""}>
              Login
            </button>
            <button type="button" onClick={() => setAuthMode("signup")} className={authMode === "signup" ? "active" : ""}>
              Signup
            </button>
          </div>
          {authMode === "signup" && (
            <>
              <label>Name</label>
              <input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
              <label>Role</label>
              <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="counselor">Counselor</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <label>Email</label>
          <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
          <label>Password</label>
          <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
          <button type="submit">{authMode === "login" ? "Login" : "Create account"}</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Student Wellness Tracker Plan</h1>
          <p className="subtitle">
            Signed in as {user.name} ({user.role})
          </p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <nav className="tabs">
        {visibleTabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {statusMessage && <p className="ok">{statusMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {activeTab === "dashboard" && summary && (
        <section className="grid">
          <article className="card"><h3>Total Plans</h3><p>{summary.totalPlans}</p></article>
          <article className="card"><h3>Active Plans</h3><p>{summary.activePlans}</p></article>
          <article className="card"><h3>Total Logs</h3><p>{summary.totalLogs}</p></article>
          <article className="card"><h3>Average Mood</h3><p>{summary.averageMood}</p></article>
        </section>
      )}

      {activeTab === "plans" && (
        <section className="grid2">
          {isStudent && (
            <form className="card form" onSubmit={createPlan}>
              <h3>Create Wellness Plan</h3>
              <input placeholder="Plan title" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} required />
              <input placeholder="Category" value={planForm.category} onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })} required />
              <input type="number" placeholder="Target value" value={planForm.targetValue} onChange={(e) => setPlanForm({ ...planForm, targetValue: Number(e.target.value) })} required />
              <input placeholder="Unit" value={planForm.unit} onChange={(e) => setPlanForm({ ...planForm, unit: e.target.value })} required />
              <label>Start date</label>
              <input type="date" value={planForm.startDate} onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })} required />
              <label>End date</label>
              <input type="date" value={planForm.endDate} onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })} required />
              <button type="submit">Save plan</button>
            </form>
          )}
          <div className="card">
            <h3>Plans</h3>
            <ul className="list">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <strong>{plan.title}</strong> ({plan.category}) - target {plan.target_value} {plan.unit}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === "logs" && (
        <section className="grid2">
          {isStudent && (
            <form className="card form" onSubmit={createLog}>
              <h3>Add Daily Wellness Log</h3>
              <select value={logForm.planId} onChange={(e) => setLogForm({ ...logForm, planId: Number(e.target.value) })} required>
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option value={plan.id} key={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
              <label>Date</label>
              <input type="date" value={logForm.logDate} onChange={(e) => setLogForm({ ...logForm, logDate: e.target.value })} required />
              <label>Mood score (1-5)</label>
              <input type="number" min="1" max="5" value={logForm.moodScore} onChange={(e) => setLogForm({ ...logForm, moodScore: Number(e.target.value) })} />
              <label>Sleep hours</label>
              <input type="number" value={logForm.sleepHours} onChange={(e) => setLogForm({ ...logForm, sleepHours: Number(e.target.value) })} />
              <label>Water liters</label>
              <input type="number" value={logForm.waterLiters} onChange={(e) => setLogForm({ ...logForm, waterLiters: Number(e.target.value) })} />
              <label>Exercise minutes</label>
              <input type="number" value={logForm.exerciseMinutes} onChange={(e) => setLogForm({ ...logForm, exerciseMinutes: Number(e.target.value) })} />
              <textarea placeholder="Notes" value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} />
              <button type="submit">Add log</button>
            </form>
          )}
          <div className="card">
            <h3>Progress Logs</h3>
            <ul className="list">
              {logs.map((log) => (
                <li key={log.id}>
                  {log.log_date}: mood {log.mood_score}, sleep {log.sleep_hours}h, exercise {log.exercise_minutes}m
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === "slots" && (
        <section className="grid2">
          {(isCounselor || isAdmin) && (
            <form className="card form" onSubmit={createSlot}>
              <h3>Create Counseling Slot</h3>
              <input type="date" value={slotForm.slotDate} onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })} required />
              <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
              <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
              <select value={slotForm.mode} onChange={(e) => setSlotForm({ ...slotForm, mode: e.target.value })}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              <button type="submit">Add slot</button>
            </form>
          )}
          <div className="card">
            <h3>Available Slots</h3>
            <ul className="list">
              {slots.map((slot) => (
                <li key={slot.id}>
                  #{slot.id} - {slot.slot_date} {slot.start_time}-{slot.end_time} ({slot.mode})
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === "appointments" && (
        <section className="grid2">
          {isStudent && (
            <form className="card form" onSubmit={bookAppointment}>
              <h3>Book Appointment</h3>
              <select value={appointmentForm.slotId} onChange={(e) => setAppointmentForm({ ...appointmentForm, slotId: Number(e.target.value) })} required>
                <option value="">Select slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    #{slot.id} {slot.slot_date} {slot.start_time}
                  </option>
                ))}
              </select>
              <textarea placeholder="Concern details" value={appointmentForm.concern} onChange={(e) => setAppointmentForm({ ...appointmentForm, concern: e.target.value })} required />
              <button type="submit">Request appointment</button>
            </form>
          )}
          <div className="card">
            <h3>Appointments</h3>
            <ul className="list">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  #{appointment.id} slot {appointment.slot_id} - {appointment.status}
                  <br />
                  {appointment.slot_date} {appointment.start_time}-{appointment.end_time}
                  {(isCounselor || isAdmin) && appointment.status === "pending" && (
                    <span className="actions">
                      <button onClick={() => updateAppointmentStatus(appointment.id, "approved")}>Approve</button>
                      <button onClick={() => updateAppointmentStatus(appointment.id, "rejected")}>Reject</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
