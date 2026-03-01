import { Briefcase, CalendarRange, Home, LayoutGrid, Users } from 'lucide-react';

// We now accept currentScreen and setCurrentScreen as props
function BottomNav({ currentScreen, setCurrentScreen, role, navItems: customNavItems }) {
  const defaultNavItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'jobs', name: 'Jobs', icon: Briefcase },
    { id: 'contracts', name: 'Timeline', icon: CalendarRange },
    { id: 'workers', name: 'Workers', icon: Users },
    { id: 'services', name: 'Services', icon: LayoutGrid }
  ];
  const navItems = customNavItems || defaultNavItems;
  const visibleNavItems =
    role === 'worker'
      ? navItems
      : navItems;

  return (
    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xl border border-white/70 px-5 py-3 flex justify-between items-center z-50 rounded-2xl shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
      {visibleNavItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id; // Check if this is the active tab

        return (
          <div
            key={index}
            onClick={() => setCurrentScreen(item.id)} // This changes the screen!
            className={`flex flex-col items-center gap-1 cursor-pointer group px-2 py-1 rounded-xl transition ${
              isActive ? 'bg-blue-50/80' : 'hover:bg-gray-50'
            }`}
          >
            <Icon size={24} className={`${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`} />
            <span className={`text-[10px] font-medium ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-400'} transition-colors`}>
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;

