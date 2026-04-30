import { CalendarClock, ClipboardList, HeartPulse, LayoutDashboard, ListChecks } from "lucide-react";

const tabIcons = {
  dashboard: LayoutDashboard,
  plans: ClipboardList,
  logs: ListChecks,
  appointments: CalendarClock,
  slots: HeartPulse,
};

function TabsNav({ visibleTabs, activeTab, setActiveTab, formatTab }) {
  return (
    <nav className="tabs glass">
      {visibleTabs.map((tab) => {
        const Icon = tabIcons[tab];
        return (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            {Icon ? <Icon size={16} strokeWidth={2.2} /> : null}
            {formatTab(tab)}
          </button>
        );
      })}
    </nav>
  );
}

export default TabsNav;
