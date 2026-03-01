import { Clock3, MapPin } from 'lucide-react';

function WorkerRequestsScreen({ requests = [], onAccept, onDecline }) {
  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Requests</h1>
      <p className="text-sm text-gray-500 mb-5">Incoming client requests waiting for company response.</p>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 bg-white/80">
          No pending requests.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.slice(0, 3).map((request) => (
            <article key={request.id} className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <h2 className="text-sm font-bold text-gray-900">{request.requestedService || request.title}</h2>
              <p className="text-xs text-gray-500 mt-1">Client: {request.clientName}</p>
              <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                <MapPin size={12} />
                {request.location}
              </p>
              <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1 ml-2">
                <Clock3 size={12} />
                {request.proposedTime}
              </p>
              {request.note && (
                <p className="text-xs text-gray-600 mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
                  <span className="font-semibold text-gray-700">Client note:</span> {request.note}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => onDecline?.(request.id)}
                  className="w-full border border-red-200 text-red-600 font-semibold py-2.5 rounded-xl hover:bg-red-50 transition"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => onAccept?.(request.id)}
                  className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  Accept
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerRequestsScreen;

