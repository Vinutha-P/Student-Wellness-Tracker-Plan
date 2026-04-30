import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import AuthPage from "./components/AuthPage";
import HeaderBar from "./components/HeaderBar";
import TabsNav from "./components/TabsNav";
import DashboardTab from "./components/DashboardTab";
import PlansTab from "./components/PlansTab";
import LogsTab from "./components/LogsTab";
import SlotsTab from "./components/SlotsTab";
import AppointmentsTab from "./components/AppointmentsTab";

const AUTH_API = "http://localhost:4001";
const WELLNESS_API = "http://localhost:4002";
const APPOINTMENT_API = "http://localhost:4003";

const getAuthHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const prettifyRole = (role) => role.charAt(0).toUpperCase() + role.slice(1);

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
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
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;

  const tabs = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", path: "/dashboard" },
      { key: "plans", label: "Plans", path: "/plans" },
      { key: "logs", label: "Logs", path: "/logs" },
      { key: "appointments", label: "Appointments", path: "/appointments" },
      { key: "slots", label: "Slots", path: "/slots" },
    ],
    []
  );

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
      navigate("/dashboard", { replace: true });
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
    navigate("/login", { replace: true });
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

  if (!user)
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <AuthPage
              authMode={authMode}
              setAuthMode={setAuthMode}
              authForm={authForm}
              setAuthForm={setAuthForm}
              onAuthSubmit={onAuthSubmit}
              errorMessage={errorMessage}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );

  return (
    <main className="container app-shell">
      <HeaderBar user={user} prettifyRole={prettifyRole} logout={logout} />
      <TabsNav tabs={tabs} />

      {statusMessage && <p className="notice ok">{statusMessage}</p>}
      {errorMessage && <p className="notice error">{errorMessage}</p>}

      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            summary ? (
              <DashboardTab
                summary={summary}
                plans={plans}
                logs={logs}
                slots={slots}
                pendingAppointments={pendingAppointments}
              />
            ) : null
          }
        />
        <Route
          path="/plans"
          element={
            <PlansTab
              isStudent={isStudent}
              planForm={planForm}
              setPlanForm={setPlanForm}
              createPlan={createPlan}
              plans={plans}
            />
          }
        />
        <Route
          path="/logs"
          element={
            <LogsTab
              isStudent={isStudent}
              logForm={logForm}
              setLogForm={setLogForm}
              createLog={createLog}
              plans={plans}
              logs={logs}
            />
          }
        />
        <Route
          path="/appointments"
          element={
            <AppointmentsTab
              isStudent={isStudent}
              isCounselor={isCounselor}
              isAdmin={isAdmin}
              appointmentForm={appointmentForm}
              setAppointmentForm={setAppointmentForm}
              bookAppointment={bookAppointment}
              slots={slots}
              appointments={appointments}
              updateAppointmentStatus={updateAppointmentStatus}
            />
          }
        />
        <Route
          path="/slots"
          element={
            <SlotsTab
              isCounselor={isCounselor}
              isAdmin={isAdmin}
              slotForm={slotForm}
              setSlotForm={setSlotForm}
              createSlot={createSlot}
              slots={slots}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </main>
  );
}

export default App;
