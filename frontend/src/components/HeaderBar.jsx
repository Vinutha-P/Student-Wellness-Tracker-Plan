import { Bell, LogOut, Sparkles } from "lucide-react";

function HeaderBar({ user, prettifyRole, logout }) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow"><Sparkles size={14} /> Student Wellness Tracker Plan</p>
        <h1>Welcome, {user.name}</h1>
        <p className="subtitle">Stay consistent with goals, logs, and counseling sessions.</p>
        <span className={`role-badge role-${user.role}`}>{prettifyRole(user.role)}</span>
      </div>
      <div className="header-actions">
        <button className="icon-btn" type="button" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;
