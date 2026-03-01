import { Star } from 'lucide-react';

function PopularServices({ services = [], onProfileClick, onViewAll }) {
  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Popular services</h2>
        <button type="button" onClick={onViewAll} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:bg-blue-100">
          View all
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center bg-white/80">
          No workers match your search yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onProfileClick?.(service)}
              className="cursor-pointer group text-left rounded-2xl bg-white/80 border border-white p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_22px_rgba(15,23,42,0.1)] transition"
            >
              <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold py-1 px-2 rounded-lg flex items-center gap-1">
                  <Star size={12} className="text-blue-400 fill-blue-400" />
                  {service.rating} ({service.reviews})
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 px-1">{service.name}</h4>
              <p className="text-xs text-gray-500 px-1">{service.role}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularServices;

