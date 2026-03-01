import { Bolt, Droplets, Hammer, Paintbrush, Recycle, Sparkles, Trees, Wrench } from 'lucide-react';

const iconByName = {
  paintbrush: Paintbrush,
  wrench: Wrench,
  bolt: Bolt,
  hammer: Hammer,
  droplets: Droplets,
  sparkles: Sparkles,
  recycle: Recycle,
  trees: Trees
};

function ServicesScreen({ services = [], onSelectService }) {
  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">All Services</h1>
      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center bg-white/80">
          No services match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => {
            const Icon = iconByName[service.icon] || Wrench;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService?.(service)}
                className="border border-white rounded-2xl p-4 text-left bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)] transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${service.bg}`}>
                  <Icon size={20} className={service.color} />
                </div>
                <h2 className="text-sm font-bold text-gray-900">{service.name}</h2>
                <p className="text-xs text-gray-500 mt-1">Verified providers available</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServicesScreen;

