import { useMemo, useState } from 'react';

function WorkerSetupScreen({ services = [], initialSelected = [], onSave }) {
  const [selected, setSelected] = useState(initialSelected);
  const [customCategory, setCustomCategory] = useState('');

  const knownServiceNames = useMemo(() => new Set(services.map((service) => service.name)), [services]);

  const customSelectedCategories = useMemo(
    () => selected.filter((name) => !knownServiceNames.has(name)),
    [selected, knownServiceNames]
  );

  const toggleService = (serviceName) => {
    setSelected((prev) =>
      prev.includes(serviceName) ? prev.filter((name) => name !== serviceName) : [...prev, serviceName]
    );
  };

  const addCustomCategory = () => {
    const value = customCategory.trim();
    if (!value) return;
    setSelected((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomCategory('');
  };

  const removeCustomCategory = (name) => {
    setSelected((prev) => prev.filter((item) => item !== name));
  };

  const handleSave = () => {
    const finalSelected = selected.map((name) => name.trim()).filter(Boolean);
    onSave?.(finalSelected);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Set up your company profile</h1>
      <p className="text-sm text-gray-500 mb-5">Choose all categories you offer, then add any custom ones.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {services.map((service) => {
          const isSelected = selected.includes(service.name);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-[0_8px_18px_rgba(59,130,246,0.32)]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {service.name}
            </button>
          );
        })}
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Add Custom Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Pool Maintenance"
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustomCategory();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomCategory}
            className="px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Add
          </button>
        </div>
      </div>

      {customSelectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {customSelectedCategories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => removeCustomCategory(name)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              {name} ×
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
      >
        Save and Continue
      </button>
    </div>
  );
}

export default WorkerSetupScreen;
