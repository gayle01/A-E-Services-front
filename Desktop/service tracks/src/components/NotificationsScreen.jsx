import { ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';

const kindLabel = {
  requests: 'Request',
  verification: 'Verification',
  timeline: 'Timeline',
  jobs: 'Job',
  system: 'System',
  updates: 'Update'
};

function NotificationsScreen({ onBack, notifications = [], role, onMarkAllRead, onMarkRead }) {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('Unread');
  const emptyMessageByRole = {
    client: 'No client notifications right now. New submissions and decisions will appear here.',
    company: 'No company notifications right now. Job assignments and verification updates will appear here.',
    worker: 'No worker notifications right now. Assigned work updates will appear here.'
  };

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);
  const readCount = Math.max(0, notifications.length - unreadCount);
  const visibleItems = useMemo(() => {
    const filtered =
      activeTab === 'Unread'
        ? notifications.filter((item) => item.unread)
        : notifications.filter((item) => !item.unread);
    return filtered.slice(0, 3);
  }, [notifications, activeTab]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="rounded-2xl border border-gray-100 p-2 mb-4 bg-gray-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('Unread')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === 'Unread' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Read')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === 'Read' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Read ({readCount})
        </button>
      </div>

      {unreadCount > 0 && (
        <button
          type="button"
          onClick={onMarkAllRead}
          className="inline-flex mb-4 border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-blue-100 transition"
        >
          Mark all unread as read
        </button>
      )}

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center">
          {activeTab === 'Unread' ? 'No unread notifications.' : (emptyMessageByRole[role] || 'You are all caught up.')}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onMarkRead?.(item.id);
                setSelectedNotification(item);
              }}
              className="w-full text-left border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] uppercase tracking-wide text-gray-600">
                    {kindLabel[item.kind] || 'Update'}
                  </span>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.body}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">{item.time}</p>
                  {item.unread && <span className="inline-block mt-1 w-2 h-2 rounded-full bg-blue-500" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedNotification && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="text-base font-bold text-gray-900">{selectedNotification.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{selectedNotification.time}</p>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{selectedNotification.body}</p>
            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="w-full mt-4 bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsScreen;
