﻿import { ChevronLeft, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

function AccountScreen({ onBack, user, onLogout, onOpenAuth, onSaveProfile, onClearDemoData }) {
  const isSignedIn = Boolean(user && user.role !== 'guest');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    about: ''
  });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      about: user?.about || ''
    });
  }, [user]);

  const handleSave = () => {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      about: form.about.trim()
    };
    onSaveProfile?.(payload);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50/70 via-white to-white">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl border border-white bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="rounded-3xl border border-white bg-white/90 p-5 mb-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3 mb-4">
          <img src="https://i.pravatar.cc/150?img=11" alt={isSignedIn ? user.name : 'Guest'} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-base font-bold text-gray-900">{isSignedIn ? user.name : 'Guest User'}</p>
              <ShieldCheck size={14} className="text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">
              {isSignedIn ? `${user.role === 'company' ? 'Company' : user.role === 'worker' ? 'Worker' : 'Client'} account` : 'Not signed in'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="inline-flex items-center gap-2"><Mail size={14} className="text-blue-500" /> {isSignedIn ? user.email : 'No email yet'}</p>
          <p className="inline-flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {isSignedIn ? (user.phone || 'Not set') : 'Not set'}</p>
          <p className="inline-flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {isSignedIn ? (user.location || 'Not set') : 'Not set'}</p>
          {isSignedIn && (
            <p className="text-xs text-gray-500 mt-2">{user.about || 'No profile bio yet.'}</p>
          )}
        </div>
      </div>

      {isSignedIn ? (
        <div className="space-y-3">
          {isEditing ? (
            <div className="rounded-3xl border border-white bg-white/90 p-4 space-y-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
              />
              <input
                type="text"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone"
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
              />
              <input
                type="text"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Location"
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
              />
              <textarea
                value={form.about}
                onChange={(event) => setForm((prev) => ({ ...prev, about: event.target.value }))}
                placeholder="About"
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm('Clear all demo/test jobs, requests, timeline, and notifications?');
              if (!confirmed) return;
              onClearDemoData?.();
            }}
            className="w-full border border-orange-200 text-orange-600 font-semibold py-3 rounded-xl hover:bg-orange-50 transition"
          >
            Clear Demo/Test Data
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition"
        >
          Sign In / Sign Up
        </button>
      )}
    </div>
  );
}

export default AccountScreen;
