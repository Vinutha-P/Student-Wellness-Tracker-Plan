import { CalendarClock, HeartPulse, ShieldCheck } from "lucide-react";

function AuthPage({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  onAuthSubmit,
  errorMessage,
}) {
  return (
    <main className="auth-page">
      <section className="auth-hero glass">
        <p className="eyebrow">Student Wellness Tracker</p>
        <h1>Build healthier routines with guided tracking.</h1>
        <p className="subtitle">
          One elegant platform for wellness goals, daily reflections, and counseling appointments.
        </p>
        <ul className="hero-points">
          <li><HeartPulse size={16} /> Personalized wellness plans with measurable targets</li>
          <li><ShieldCheck size={16} /> Smart progress logging and role-aware dashboard views</li>
          <li><CalendarClock size={16} /> Appointment workflows for students, counselors, and admins</li>
        </ul>
      </section>

      <form className="card form auth-card" onSubmit={onAuthSubmit}>
        <div className="row tab-switch">
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

        <button type="submit" className="primary-btn">
          {authMode === "login" ? "Login" : "Create account"}
        </button>
        {errorMessage && <p className="notice error">{errorMessage}</p>}
      </form>
    </main>
  );
}

export default AuthPage;
