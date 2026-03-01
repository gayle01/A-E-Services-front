﻿import { useMemo, useState } from 'react';
import { MapPin, Star, Wrench } from 'lucide-react';

const tabs = ['Active', 'Completed', 'Verified'];

const activeJobs = [
  {
    id: 1,
    title: 'Office Deep Cleaning',
    date: '30 May, 2024',
    time: '08:00 AM - 10:00 AM',
    providerName: 'John Doe',
    location: 'Accra',
    rating: '4.9',
    status: 'Active',
    serviceIcon: Wrench,
    providerImage: 'https://i.pravatar.cc/100?img=14'
  }
];

function MyJobs({ jobs = [], onOpenVerify, onOpenVerifiedDetails, onCallWorker }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const sourceJobs = jobs.length > 0 ? jobs : activeJobs;

  const tabJobs = useMemo(() => {
    const byTab = sourceJobs.filter((job) => {
      if (activeTab === 'Active') return ['Assigned', 'Active', 'Requested', 'Reschedule Requested'].includes(job.status);
      if (activeTab === 'Completed') return ['Completed'].includes(job.status);
      return ['Verified', 'History'].includes(job.status);
    });

    const query = search.trim().toLowerCase();
    const filtered = query
      ? byTab.filter((job) =>
          [job.title, job.providerName, job.location, job.date, job.time].some((value) =>
            String(value || '').toLowerCase().includes(query)
          )
        )
      : byTab;

    const sorted = [...filtered];
    sorted.sort((a, b) => (sort === 'oldest' ? a.id - b.id : b.id - a.id));
    return sorted;
  }, [sourceJobs, activeTab, search, sort]);

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My jobs</h1>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search jobs"
          className="col-span-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="col-span-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="flex bg-white/80 border border-white rounded-2xl p-1 mb-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {tabJobs.length > 0 ? (
        <div className="space-y-4">
          {tabJobs.map((job) => {
            const ServiceIcon = job.serviceIcon || Wrench;
            const isVerified = ['Verified', 'History'].includes(job.status);
            const isCompleted = ['Completed'].includes(job.status);
            const isActive = ['Assigned', 'Active', 'Reschedule Requested'].includes(job.status);

            return (
              <article key={job.id} className="border border-white rounded-2xl p-4 bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <ServiceIcon size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{job.title}</h2>
                    <p className="text-xs text-gray-500">{job.date}</p>
                    <p className="text-xs text-gray-500">{job.time}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={job.providerImage} alt={job.providerName} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.providerName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="text-blue-400 fill-blue-400" />
                          {job.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isVerified ? 'text-green-600' : isCompleted ? 'text-gray-600' : isActive ? (job.status === 'Reschedule Requested' ? 'text-orange-600' : 'text-blue-600') : 'text-gray-500'
                    }`}
                  >
                    {isVerified ? 'Verified' : isCompleted ? 'Completed' : isActive ? (job.status === 'Reschedule Requested' ? 'Reschedule Req.' : 'Active') : job.status}
                  </span>
                </div>

                {isCompleted ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onCallWorker?.(job)}
                      className="w-auto px-6 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition"
                    >
                      Call
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenVerify?.(job.id)}
                      className="w-auto px-6 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                    >
                      Review & Verify
                    </button>
                  </div>
                ) : isVerified ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onCallWorker?.(job)}
                      className="w-auto px-6 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition"
                    >
                      Call
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenVerifiedDetails?.(job.id)}
                      className="w-auto px-6 border border-emerald-200 text-emerald-700 font-semibold py-2.5 rounded-xl hover:bg-emerald-50 transition"
                    >
                      View Verified Details
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCallWorker?.(job)}
                    className="w-auto px-6 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition"
                  >
                    Call
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 py-10 px-4 text-center text-sm text-gray-500">
          No {activeTab.toLowerCase()} jobs yet.
        </div>
      )}
    </div>
  );
}

export default MyJobs;
