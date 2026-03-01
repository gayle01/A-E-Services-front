import { Briefcase, CheckCircle2, Clock3, MapPin, Navigation, Plus, Star, Users, X } from 'lucide-react';
import { useState } from 'react';

function WorkerDashboardScreen({
  completedJobs = 0,
  pendingRequests = 0,
  rating = 0,
  upcomingJob,
  activeJobsCount = 0,
  workers = [],
  isCompany = false,
  onAddWorker,
  onNavigate,
  onOpenRequests
}) {
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '' });
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : '0.0';

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{isCompany ? 'Company Dashboard' : 'Worker Dashboard'}</h1>
          <p className="text-sm text-gray-500">{isCompany ? 'Manage your team and operations.' : 'Manage your day and incoming jobs.'}</p>
        </div>
        <span className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Online
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] text-gray-500 mb-1">Completed</p>
          <p className="text-sm font-bold text-gray-900">{completedJobs}</p>
          <CheckCircle2 size={14} className="text-emerald-600 mt-1" />
        </div>
        {isCompany ? (
          <button
            type="button"
            onClick={onOpenRequests}
            className="rounded-2xl border border-white bg-white/90 p-3 text-left shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
          >
            <p className="text-[11px] text-gray-500 mb-1">Requests</p>
            <p className="text-sm font-bold text-gray-900">{pendingRequests}</p>
            <Clock3 size={14} className="text-blue-500 mt-1" />
          </button>
        ) : (
          <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] text-gray-500 mb-1">Active Jobs</p>
            <p className="text-sm font-bold text-gray-900">{activeJobsCount}</p>
            <Clock3 size={14} className="text-blue-500 mt-1" />
          </div>
        )}
        <div className="rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] text-gray-500 mb-1">Rating</p>
          <p className="text-sm font-bold text-gray-900">{safeRating}</p>
          <Star size={14} className="text-blue-500 fill-blue-500 mt-1" />
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-5 text-white shadow-[0_18px_34px_rgba(15,23,42,0.3)]">
        {isCompany ? (
          <>
            <p className="text-xs text-sky-200 mb-1">Company Overview</p>
            <h2 className="text-lg font-extrabold leading-tight mb-4">Team Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-2xl font-bold">{workers.length}</p>
                <p className="text-xs text-slate-300">Total Workers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-2xl font-bold">{activeJobsCount}</p>
                <p className="text-xs text-slate-300">Active Jobs</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-sky-200 mb-1">Today's Next Job</p>
            {upcomingJob ? (
              <>
                <h2 className="text-lg font-extrabold leading-tight mb-2">{upcomingJob.title}</h2>
                <p className="text-sm text-slate-200">Client: {upcomingJob.clientName || 'N/A'}</p>
                <p className="text-xs text-slate-300 inline-flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {upcomingJob.location}
                </p>
                <p className="text-xs text-slate-300 mt-1">{upcomingJob.date} • {upcomingJob.time}</p>
                <button
                  type="button"
                  onClick={onNavigate}
                  className="mt-4 inline-flex items-center gap-2 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition"
                >
                  <Navigation size={14} />
                  Navigate
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-200">No upcoming jobs scheduled.</p>
            )}
          </>
        )}
      </div>

      {isCompany && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">My Team</h3>
            <button
              onClick={() => setShowAddWorker(true)}
              className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
            >
              <Plus size={14} /> Add Worker
            </button>
          </div>
          
          {workers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80 text-center">
              No workers added yet.
            </div>
          ) : (
            <div className="space-y-2">
              {workers.map((worker) => (
                <div key={worker.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{worker.name}</p>
                    <p className="text-xs text-gray-500">{worker.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Worker</h3>
              <button onClick={() => setShowAddWorker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newWorker.name}
                onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email (Login ID)"
                value={newWorker.email}
                onChange={(e) => setNewWorker({...newWorker, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={newWorker.password}
                onChange={(e) => setNewWorker({...newWorker, password: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newWorker.name && newWorker.email && newWorker.password) {
                    onAddWorker(newWorker);
                    setNewWorker({ name: '', email: '', password: '' });
                    setShowAddWorker(false);
                  }
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Create Worker Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboardScreen;



