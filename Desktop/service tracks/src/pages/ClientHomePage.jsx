import { CalendarClock, CheckCircle2, CircleX, FolderOpen, Handshake, TriangleAlert } from 'lucide-react';
import Header from '../components/Header';

function ClientHomePage({
  searchQuery,
  onSearchChange,
  onOpenAccount,
  onOpenNotifications,
  onOpenMenu,
  unreadNotifications,
  user,
  onOpenContracts,
  onOpenVerificationItem,
  onOpenCompanies,
  companiesCount = 0,
  verificationQueue = [],
  verificationStats = { submitted: 0, rejected: 0, verified: 0, missed: 0 }
}) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
      <div className="p-6 md:p-8 pb-24">
        <Header
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onProfileClick={onOpenAccount}
          onNotificationClick={onOpenNotifications}
          onMenuClick={onOpenMenu}
          unreadCount={unreadNotifications}
          user={user}
        />

        <section className="grid gap-4 md:grid-cols-3 mb-4">
          <article className="relative overflow-hidden rounded-3xl p-4 min-h-[200px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 shadow-[0_16px_28px_rgba(15,23,42,0.28)]">
            <div className="relative z-10 w-[68%]">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-100 bg-white/10 rounded-full px-2 py-1 mb-2">
                <FolderOpen size={12} />
                Contract
              </div>
              <h2 className="text-base font-extrabold text-white">View Contract</h2>
              <p className="text-xs text-blue-100 mt-1">Open your active contract timeline and monitor progress.</p>
              <button
                type="button"
                onClick={onOpenContracts}
                className="mt-3 bg-white text-slate-900 text-sm font-semibold py-2 px-4 rounded-full hover:bg-slate-100 transition"
              >
                View Contract
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-[38%] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop"
                alt="Contract"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/80" />
            </div>
          </article>

          <article className="relative overflow-hidden rounded-3xl p-4 min-h-[200px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 shadow-[0_16px_28px_rgba(6,95,70,0.28)]">
            <div className="relative z-10 w-[68%]">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-100 bg-white/10 rounded-full px-2 py-1 mb-2">
                <CalendarClock size={12} />
                Verification
              </div>
              <h2 className="text-base font-extrabold text-white">Verify Jobs</h2>
              <p className="text-xs text-emerald-100 mt-1">Review submitted work and approve or reject updates.</p>
              <span className="inline-flex mt-2 items-center justify-center min-w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold px-2">
                {verificationStats.submitted}
              </span>
              <button
                type="button"
                onClick={() => (verificationQueue[0] ? onOpenVerificationItem?.(verificationQueue[0]) : onOpenContracts?.())}
                className="mt-3 bg-white text-emerald-900 text-sm font-semibold py-2 px-4 rounded-full hover:bg-emerald-50 transition"
              >
                Verify Jobs
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-[38%] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300&auto=format&fit=crop"
                alt="Verify"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald-800/80" />
            </div>
          </article>

          <article className="relative overflow-hidden rounded-3xl p-4 min-h-[200px] bg-gradient-to-br from-amber-700 via-orange-600 to-rose-600 shadow-[0_16px_28px_rgba(194,65,12,0.28)]">
            <div className="relative z-10 w-[68%]">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-100 bg-white/10 rounded-full px-2 py-1 mb-2">
                <Handshake size={12} />
                Service
              </div>
              <h2 className="text-base font-extrabold text-white">Request Service</h2>
              <p className="text-xs text-orange-100 mt-1">Browse companies and send service requests quickly.</p>
              <span className="inline-flex mt-2 text-xs font-semibold text-white bg-white/15 rounded-full px-3 py-1">
                {companiesCount} companies available
              </span>
              <button
                type="button"
                onClick={onOpenCompanies}
                className="mt-3 bg-white text-orange-700 text-sm font-semibold py-2 px-4 rounded-full hover:bg-orange-50 transition"
              >
                Request Service
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-[38%] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=300&auto=format&fit=crop"
                alt="Service"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-orange-700/80" />
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Statistics</h2>
            <div className="space-y-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Verified
                </p>
                <span className="text-sm font-bold text-emerald-700">{verificationStats.verified}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                  <CircleX size={14} className="text-red-600" />
                  Rework Required
                </p>
                <span className="text-sm font-bold text-red-700">{verificationStats.rejected}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                  <TriangleAlert size={14} className="text-orange-600" />
                  Marked Missed
                </p>
                <span className="text-sm font-bold text-orange-700">{verificationStats.missed}</span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default ClientHomePage;
