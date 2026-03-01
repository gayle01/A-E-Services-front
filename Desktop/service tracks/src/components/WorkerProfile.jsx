import { ArrowRight, Bookmark, CalendarDays, CheckCircle2, ChevronLeft, MapPin, Phone, ShieldCheck, Star, Upload } from 'lucide-react';

function WorkerProfile({ onBack, onBook, onCall, onToggleBookmark, onViewLatestUpdate, worker, actionLabel = 'Open Assigned Jobs' }) {
  const selectedWorker = worker || {
    name: 'Fatima Abdullahi',
    role: 'Cleaner',
    location: 'East Legon, Accra',
    rating: 4.5,
    reviews: 102,
    serviceType: 'Cleaning Services',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=150&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop'
  };

  const workflow = [
    { id: 'assign', title: '1. Assignment', desc: 'Company defines and assigns the job.' },
    { id: 'execute', title: '2. Execution', desc: 'Worker completes the assigned scope.' },
    { id: 'proof', title: '3. Proof Upload', desc: 'Worker uploads image evidence of progress/completion.' },
    { id: 'verify', title: '4. Verification', desc: 'Client verifies or rejects. Rejected work is redone and resubmitted.' }
  ];

  const recentUpdates = [
    { id: 1, title: 'Office Deep Cleaning', date: '12 Feb 2026', status: 'Verified' }
  ];

  return (
    <div className="bg-transparent min-h-screen relative pb-24">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={selectedWorker.coverImage || selectedWorker.image}
          alt={`${selectedWorker.role} working`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <ChevronLeft size={20} className="text-gray-900" />
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1 text-xs px-3 py-2 rounded-xl transition ${worker?.isBookmarked ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
          >
            <Bookmark size={13} className={worker?.isBookmarked ? 'fill-white' : ''} />
            {worker?.isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 -mt-8 relative z-10">
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden bg-gray-200 shadow-sm">
                <img src={selectedWorker.image} alt={selectedWorker.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold text-gray-900">{selectedWorker.name}</h1>
                  <ShieldCheck size={16} className="text-blue-500" />
                </div>
                <p className="text-sm text-gray-600">{selectedWorker.serviceType || selectedWorker.role}</p>
                <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {selectedWorker.location}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCall}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            >
              <Phone size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-xl bg-gray-50 p-2 text-center">
              <p className="text-[11px] text-gray-500">Rating</p>
              <p className="text-sm font-bold text-gray-900 inline-flex items-center gap-1 justify-center">
                <Star size={12} className="text-blue-500 fill-blue-500" />
                {selectedWorker.rating}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2 text-center">
              <p className="text-[11px] text-gray-500">Reviews</p>
              <p className="text-sm font-bold text-gray-900">{selectedWorker.reviews || 0}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2 text-center">
              <p className="text-[11px] text-gray-500">Proof</p>
              <p className="text-sm font-bold text-gray-900 inline-flex items-center gap-1 justify-center">
                <Upload size={12} className="text-blue-600" />
                Image-based
              </p>
            </div>
          </div>
        </div>

        <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <h2 className="text-sm font-bold text-gray-900 mb-3">How This Workflow Runs</h2>
          <div className="space-y-2">
            {workflow.map((step) => (
              <div key={step.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Job Updates</h2>
            <button
              type="button"
              onClick={onViewLatestUpdate}
              className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1"
            >
              View latest
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentUpdates.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-100 p-3">
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                  <CalendarDays size={12} />
                  {item.date}
                </p>
                <p className="text-xs font-semibold text-emerald-600 mt-2 inline-flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {item.status}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-white p-4 z-30 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          onClick={onBook}
          className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-200"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default WorkerProfile;
