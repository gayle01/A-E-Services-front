import { Building2, Droplets, Hammer, Paintbrush, Recycle, Sparkles, Trees } from 'lucide-react';

// Accept navigation and category selection handlers as props
function Categories({ onGoToServices, onSelectCategory, searchQuery = '' }) {
  const categories = [
    { name: 'Painter', icon: Paintbrush, color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Borehole', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Architect', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Carpenter', icon: Hammer, color: 'text-blue-700', bg: 'bg-blue-50' },
    { name: 'Cleaner', icon: Sparkles, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Waste', icon: Recycle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Gardener', icon: Trees, color: 'text-lime-600', bg: 'bg-lime-50' }
  ];
  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = query
    ? categories.filter((category) => category.name.toLowerCase().includes(query))
    : categories;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Service Categories</h2>
        <button
          onClick={onGoToServices}
          className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:bg-blue-100 transition"
        >
          View all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              onClick={() => onSelectCategory?.(category.name)}
              className="flex flex-col items-center gap-2 min-w-[86px] cursor-pointer group rounded-2xl bg-white/80 border border-white px-3 py-3 shadow-[0_6px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)] transition"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${category.bg}`}>
                <Icon size={24} className={category.color} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{category.name}</span>
            </div>
          );
        })}
        {filteredCategories.length === 0 && (
          <p className="text-xs text-gray-500 py-3">No category matches your search.</p>
        )}
      </div>
    </div>
  );
}

export default Categories;

