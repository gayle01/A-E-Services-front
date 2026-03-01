import { CalendarClock, CheckCircle2, CircleX, TriangleAlert } from 'lucide-react';
import Header from '../components/Header';
import PromoBanner from '../components/PromoBanner';

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
  verificationStats = { submitted: 0, rejected: 0, verified: 0, missed: 0 },
  recentActivities = [],
  onOpenActivity
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

        <PromoBanner onOpenJobs={onOpenContracts} />

        <section className="rounded-2xl border border-white bg-white/85 p-4 mb-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">Request a Service</h2>
          <p className="text-xs text-gray-500 mt-1">
            Browse companies by services, open a company profile, then send your request.
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              {companiesCount} companies available
            </span>
            <button
              type="button"
              onClick={onOpenCompanies}
              className="rounded-xl bg-slate-900 text-white text-sm font-semibold px-4 py-2 hover:bg-slate-800 transition"
            >
              Browse Companies
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Verification Queue</h2>
                <p className="text-xs text-gray-500 mt-1">Submitted jobs waiting for your decision.</p>
              </div>
              <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-bold px-2">
                {verificationStats.submitted}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {verificationQueue.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-500 text-center">
                  No pending submissions right now.
                </div>
              ) : (
                verificationQueue.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                          <CalendarClock size={13} className="text-blue-600" />
                          {item.dateLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => (onOpenVerificationItem ? onOpenVerificationItem(item) : onOpenContracts?.())}
                        className="text-[11px] font-semibold text-blue-700 border border-blue-200 bg-white rounded-lg px-2 py-1 hover:bg-blue-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={onOpenContracts}
              className="w-full mt-3 rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 transition"
            >
              Review In Timeline
            </button>
          </article>

          <article className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Service Health</h2>
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

        <section className="rounded-2xl border border-white bg-white/85 p-4 mt-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Activities</h2>
            <button
              type="button"
              onClick={onOpenNotifications}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </div>
          {recentActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-500 text-center">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.slice(0, 3).map((item) => (
                <article key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.body}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{item.time}</p>
                    </div>
                    {item.kind === 'verification' && item.meta && (
                      <button
                        type="button"
                        onClick={() => onOpenActivity?.(item)}
                        className="text-[11px] font-semibold text-blue-700 border border-blue-200 bg-white rounded-lg px-2 py-1 hover:bg-blue-50"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ClientHomePage;
