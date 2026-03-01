﻿import { useState } from 'react';

function WorkerSetupScreen({ services = [], initialSelected = [], onSave }) {
  const [selected, setSelected] = useState(initialSelected);
  const [customCategory, setCustomCategory] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const toggleService = (serviceName) => {
    if (serviceName === 'Other') {
      setShowOtherInput((prev) => !prev);
      if (selected.includes('Other')) {
        setSelected((prev) => prev.filter((name) => name !== 'Other'));
      } else {
        setSelected((prev) => [...prev, 'Other']);
      }
      return;
    }
    setSelected((prev) =>
      prev.includes(serviceName) ? prev.filter((name) => name !== serviceName) : [...prev, serviceName]
    );
  };

  const handleSave = () => {
    let finalSelected = [...selected];
    if (finalSelected.includes('Other')) {
      finalSelected = finalSelected.filter((s) => s !== 'Other');
      if (customCategory.trim()) {
        finalSelected.push(customCategory.trim());
      }
    }
    onSave?.(finalSelected);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Set up your company profile</h1>
      <p className="text-sm text-gray-500 mb-5">Choose the categories you work under.</p>

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
        <button
          type="button"
          onClick={() => toggleService('Other')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            selected.includes('Other')
              ? 'bg-blue-500 text-white shadow-[0_8px_18px_rgba(59,130,246,0.32)]'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Other
        </button>
      </div>

      {showOtherInput && (
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Add Custom Category</label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Pool Maintenance"
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          />
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
