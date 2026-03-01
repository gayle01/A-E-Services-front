import { Bell, MapPin, Star, Wallet } from 'lucide-react';
import { useState } from 'react';

const newRequests = [
  {
    id: 1,
    clientName: 'John Doe',
    service: 'AC Repair',
    dateTime: 'Today, 12:30 PM',
    priority: 'Urgent',
    avatar: 'https://i.pravatar.cc/120?img=11'
  },
  {
    id: 2,
    clientName: 'Ada Nwosu',
    service: 'Electrical Fix',
    dateTime: 'Tomorrow, 09:00 AM',
    priority: 'Normal',
    avatar: 'https://i.pravatar.cc/120?img=47'
  }
];

function WorkerDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="p-6 pb-24">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=120&auto=format&fit=crop"
            alt="Fatima"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <p className="text-xs text-gray-500">Worker Dashboard</p>
            <h1 className="text-lg font-extrabold text-gray-900">Welcome back, Fatima</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline((prev) => !prev)}
          className={`px-3 py-2 rounded-full text-xs font-bold border transition ${
            isOnline
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle bg-current" />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] text-gray-500 mb-1">Completed</p>
          <p className="text-sm font-bold text-gray-900">12 jobs</p>
          <Wallet size={14} className="text-emerald-600 mt-1" />
        </div>
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] text-gray-500 mb-1">Pending Requests</p>
          <p className="text-sm font-bold text-gray-900">3 New</p>
          <Bell size={14} className="text-blue-500 mt-1" />
        </div>
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] text-gray-500 mb-1">Rating</p>
          <p className="text-sm font-bold text-gray-900">4.8</p>
          <Star size={14} className="text-blue-500 fill-blue-500 mt-1" />
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-5 text-white mb-6 shadow-[0_18px_34px_rgba(15,23,42,0.3)]">
        <p className="text-xs text-blue-200 mb-1">Next Appointment</p>
        <h2 className="text-xl font-extrabold leading-tight">John Doe</h2>
        <p className="text-sm text-slate-200 mt-1">AC Repair</p>
        <p className="text-xs text-slate-300 mt-2">Today, 10:00 AM</p>
        <p className="text-xs text-slate-300 inline-flex items-center gap-1 mt-1">
          <MapPin size={12} />
          14 Oxford Street, Osu
        </p>

        <button
          type="button"
          className="w-full mt-4 bg-white text-slate-900 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-100 transition"
        >
          View Details
        </button>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">New Requests</h3>
        <div className="space-y-3">
          {newRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img src={request.avatar} alt={request.clientName} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{request.clientName}</p>
                    <p className="text-xs text-gray-500">{request.service}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{request.dateTime}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{request.priority}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;

