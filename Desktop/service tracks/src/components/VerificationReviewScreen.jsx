import { ChevronLeft, CircleCheckBig, CircleX, Image as ImageIcon, MapPin } from 'lucide-react';
import { useState } from 'react';

function VerificationReviewScreen({ job, onBack, onApprove, onReject, readOnly = false }) {
  const [feedback, setFeedback] = useState('');
  const hasBeforeAfter = Boolean(job?.beforePhotoUrl || job?.afterPhotoUrl);
  if (!job) {
    return (
      <div className="min-h-screen p-6">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
        >
          Back
        </button>
        <p className="mt-4 text-sm text-gray-500">No work update selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl border border-white bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{readOnly ? 'Verified Job Details' : 'Verify Work Update'}</h1>
          <p className="text-xs text-gray-500">
            {readOnly ? 'Review saved proof and verification details' : 'Review proof before approving completion'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mb-4">
        <p className="text-sm font-bold text-gray-900">{job.title}</p>
        <p className="text-xs text-gray-500 mt-1">{job.date} • {job.time}</p>
        <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-2">
          <MapPin size={12} />
          {job.location}
        </p>
        {job.note && <p className="text-sm text-gray-600 mt-3">{job.note}</p>}
      </div>

      {hasBeforeAfter && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-white bg-white/85 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold text-gray-700 mb-2">Before</p>
            {job.beforePhotoUrl ? (
              <img src={job.beforePhotoUrl} alt="Before work proof" className="w-full h-36 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-36 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                <ImageIcon size={18} />
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white bg-white/85 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold text-gray-700 mb-2">After</p>
            {job.afterPhotoUrl ? (
              <img src={job.afterPhotoUrl} alt="After work proof" className="w-full h-36 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-36 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                <ImageIcon size={18} />
              </div>
            )}
          </div>
        </div>
      )}

      {Array.isArray(job.photos) && job.photos.length > 0 && (
        <div className="rounded-2xl border border-white bg-white/85 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {hasBeforeAfter ? 'Additional Uploaded Proof' : 'Worker Uploaded Proof'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {job.photos.map((photo, index) => (
              <img
                key={`${job.id}-proof-${index}`}
                src={photo}
                alt={`Proof ${index + 1}`}
                className="w-full h-28 object-cover rounded-xl border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        {readOnly ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Verification Feedback</p>
            <p className="text-sm text-gray-600">{job.verificationFeedback || 'No feedback was added.'}</p>
          </div>
        ) : (
          <>
            <label className="text-xs font-semibold text-gray-700">Feedback (optional)</label>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={3}
              placeholder="Add a note for the cleaner..."
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm resize-none"
            />
          </>
        )}
      </div>

      {readOnly ? (
        <button
          type="button"
          onClick={onBack}
          className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Back to Jobs
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onReject?.(feedback.trim())}
            className="w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition"
          >
            <CircleX size={16} />
            Reject
          </button>
          <button
            type="button"
            onClick={() => onApprove?.(feedback.trim())}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            <CircleCheckBig size={16} />
            Approve Job
          </button>
        </div>
      )}
    </div>
  );
}

export default VerificationReviewScreen;

