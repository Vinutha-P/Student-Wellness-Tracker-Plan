import { CalendarClock, ClipboardList, HeartPulse, LayoutDashboard, ListChecks } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabIcons = {
  dashboard: LayoutDashboard,
  plans: ClipboardList,
  logs: ListChecks,
  appointments: CalendarClock,
  slots: HeartPulse,
};

function TabsNav({ tabs }) {
  return (
    <nav className="tabs glass">
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.key];
        return (
          <NavLink key={tab.key} to={tab.path} className={({ isActive }) => (isActive ? "active" : "")}>
            {Icon ? <Icon size={16} strokeWidth={2.2} /> : null}
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default TabsNav;
