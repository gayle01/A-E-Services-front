import { Bell, MapPin, Menu, Search } from 'lucide-react';

function Header({
  searchQuery = '',
  onSearchChange,
  onProfileClick,
  onNotificationClick,
  unreadCount = 0,
  user,
  onMenuClick
}) {
  const displayName = user?.name || 'John Doe';
  const displayLocation =
    user?.location ||
    (user?.role === 'company'
      ? 'Company Account'
      : user?.role === 'worker'
        ? 'Worker Account'
        : user?.role === 'guest'
          ? 'Guest mode'
          : 'Accra, Ghana');

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <div
          onClick={onProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition bg-white/70 border border-white rounded-2xl px-3 py-2 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shadow-sm ring-2 ring-blue-100">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide">WELCOME BACK</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{displayName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={14} className="text-blue-500" />
              {displayLocation}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative p-3 rounded-2xl border border-white bg-white/80 hover:bg-white transition shadow-sm"
          >
            <Bell size={20} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] rounded-full bg-blue-500 text-white px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onMenuClick}
            className="p-3 rounded-2xl border border-white bg-white/80 hover:bg-white transition shadow-sm"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <h1 className="text-[28px] leading-tight font-extrabold text-gray-900 mb-4">
        Welcome back,
        <span className="text-blue-500"> {displayName}</span>
      </h1>

      <div className="relative mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search workers, updates, or milestones"
          className="w-full bg-white/90 border border-white text-gray-700 rounded-2xl py-4 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_16px_rgba(15,23,42,0.07)]"
        />
        <Search size={20} className="absolute right-4 top-4 text-gray-400" />
      </div>
    </div>
  );
}

export default Header;
