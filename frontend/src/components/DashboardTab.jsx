import { Activity, CalendarCheck2, Heart, NotebookPen, Target } from "lucide-react";

function DashboardTab({ summary, plans, logs, slots, pendingAppointments }) {
  return (
    <section className="section-stack">
      <div className="grid stat-grid">
        <article className="card stat-card">
          <div className="stat-head"><h3>Total Plans</h3><NotebookPen size={18} /></div>
          <p>{summary.totalPlans}</p>
        </article>
        <article className="card stat-card">
          <div className="stat-head"><h3>Active Plans</h3><Target size={18} /></div>
          <p>{summary.activePlans}</p>
        </article>
        <article className="card stat-card">
          <div className="stat-head"><h3>Total Logs</h3><Activity size={18} /></div>
          <p>{summary.totalLogs}</p>
        </article>
        <article className="card stat-card">
          <div className="stat-head"><h3>Average Mood</h3><Heart size={18} /></div>
          <p>{summary.averageMood}</p>
        </article>
      </div>
      <div className="grid stat-grid">
        <article className="card">
          <div className="stat-head"><h3>Appointment Queue</h3><CalendarCheck2 size={18} /></div>
          <p className="metric-big">{pendingAppointments}</p>
          <p className="muted">Pending requests awaiting action</p>
        </article>
        <article className="card">
          <h3>Activity Overview</h3>
          <p className="muted">Plans: {plans.length}</p>
          <p className="muted">Logs: {logs.length}</p>
          <p className="muted">Slots: {slots.length}</p>
        </article>
      </div>
    </section>
  );
}

export default DashboardTab;
