import { ChevronLeft, MapPin, ShieldCheck, Star } from 'lucide-react';

function WorkersScreen({
  workers = [],
  onOpenProfile,
  title = 'Workers',
  emptyText = 'No workers match your search.',
  onBack
}) {
  return (
    <div className="p-6 pb-24">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 mb-3"
        >
          <ChevronLeft size={16} />
          Back to Services
        </button>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-5">{title}</h1>
      {workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center bg-white/80">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {workers.map((worker) => (
            <button
              key={worker.id}
              type="button"
              onClick={() => onOpenProfile?.(worker)}
              className="w-full border border-white rounded-2xl p-4 flex items-center gap-3 text-left bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)] transition"
            >
              <img src={worker.image} alt={worker.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-sm font-bold text-gray-900">{worker.name}</p>
                  <ShieldCheck size={14} className="text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mb-1">{worker.role}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {worker.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} className="text-blue-400 fill-blue-400" />
                    {worker.rating} ({worker.reviews})
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-500">View</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkersScreen;
