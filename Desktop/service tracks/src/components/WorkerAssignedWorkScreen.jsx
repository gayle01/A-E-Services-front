import { CalendarClock, CalendarDays, CheckCircle2, Clock3, MapPin, UserRound, Users, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function WorkerAssignedWorkScreen({
  jobs = [],
  workers = [],
  isCompany = false,
  focusJobId,
  onFocusHandled,
  workerCategories = [],
  onStartJob,
  onAssignWorker,
  onRequestReschedule,
  onUpdateActiveJob,
  onSubmitProgress,
  onOpenLogNewUpdate,
  onOpenAccount,
  onLogout
}) {
  const isWorkerView = !isCompany;
  const [selectedActiveJob, setSelectedActiveJob] = useState(null);
  const [activeJobDraft, setActiveJobDraft] = useState(null);
  const [isEditingActiveJob, setIsEditingActiveJob] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDraft, setRescheduleDraft] = useState({ date: '', time: '', reason: '' });
  const proofPickerRef = useRef(null);
  const isJobLockedFromClientFlow = (job) => {
    const hasClient = Boolean(String(job?.clientName || '').trim());
    if (!hasClient) return false;
    // Keep all unassigned jobs editable/assignable until a worker is chosen.
    if (!job?.assignedWorkerId) return false;
    return ['Assigned', 'Active', 'Completed', 'Verified', 'Rejected', 'Reschedule Requested'].includes(job?.status);
  };

  const assignedJobs = jobs.filter((job) => ['Assigned', 'Reschedule Requested'].includes(job.status));
  const activeJobs = jobs.filter((job) => job.status === 'Active');
  const completedJobs = jobs.filter((job) => job.status === 'Completed');
  const verifiedJobs = jobs.filter((job) => job.status === 'Verified');

  const openActiveJobDetails = (job) => {
    setSelectedActiveJob(job);
    setActiveJobDraft({
      ...job,
      photos: Array.isArray(job.photos) ? job.photos : []
    });
    setIsEditingActiveJob(false);
    setIsRescheduling(false);
  };

  useEffect(() => {
    if (!focusJobId) return;
    const target = jobs.find((job) => job.id === focusJobId);
    if (!target) return;
    openActiveJobDetails(target);
    onFocusHandled?.();
  }, [focusJobId, jobs, onFocusHandled]);

  const closeActiveJobDetails = () => {
    setSelectedActiveJob(null);
    setActiveJobDraft(null);
    setIsEditingActiveJob(false);
    setIsRescheduling(false);
  };

  const saveActiveJobDetails = () => {
    if (!selectedActiveJob || !activeJobDraft) return;
    if (isJobLockedFromClientFlow(selectedActiveJob)) {
      setIsEditingActiveJob(false);
      return;
    }

    const updates = {
      title: activeJobDraft.title?.trim() || selectedActiveJob.title,
      category: activeJobDraft.category?.trim() || selectedActiveJob.category || 'General',
      clientName: activeJobDraft.clientName?.trim() || '',
      location: activeJobDraft.location?.trim() || '',
      date: activeJobDraft.date?.trim() || selectedActiveJob.date,
      time: activeJobDraft.time?.trim() || selectedActiveJob.time,
      note: activeJobDraft.note?.trim() || ''
    };

    onUpdateActiveJob?.(selectedActiveJob.id, updates);

    const nextJob = { ...selectedActiveJob, ...updates };
    setSelectedActiveJob(nextJob);
    setActiveJobDraft(nextJob);
    setIsEditingActiveJob(false);
  };

  const setProofFromFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      setActiveJobDraft((prev) => {
        if (!prev) return prev;
        const current = Array.isArray(prev.photos) ? prev.photos : [];
        return { ...prev, photos: [...current, dataUrl] };
      });
    };
    reader.readAsDataURL(file);
  };

  const saveAssignmentAndClose = () => {
    if (!selectedActiveJob || !activeJobDraft) return;
    if (isJobLockedFromClientFlow(selectedActiveJob)) {
      closeActiveJobDetails();
      return;
    }
    if (!activeJobDraft.assignedWorkerId) {
      window.alert('Select a worker before saving.');
      return;
    }
    onAssignWorker?.(selectedActiveJob.id, activeJobDraft.assignedWorkerId);
    closeActiveJobDetails();
  };

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto w-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{isCompany ? 'Company Jobs' : 'My Work'}</h1>
          <p className="text-sm text-gray-500">{isCompany ? 'Track active work and client verification.' : 'Manage your assigned jobs'}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label="Open profile"
            title="Profile"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center"
          >
            <UserRound size={16} className="text-gray-700" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white bg-white/85 p-4 mb-6 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <p className="text-xs text-gray-500 mb-2">My categories</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {workerCategories.length > 0 ? (
            workerCategories.map((category) => (
              <span key={category} className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {category}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No categories selected yet</span>
          )}
        </div>
        {isCompany && (
          <button
            type="button"
            onClick={onOpenLogNewUpdate}
            className="w-auto px-6 block mx-auto bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
          >
            Log New Work Update
          </button>
        )}
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Assigned Jobs</h2>
        {assignedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
            No newly assigned jobs.
          </div>
        ) : (
          <div className="space-y-3">
            {assignedJobs.map((job) => (
              <article 
                key={job.id} 
                onClick={() => openActiveJobDetails(job)}
                className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] cursor-pointer hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)] transition"
              >
                <p className="text-sm font-bold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-500">{job.date} - {job.time}</p>
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Client:</span> {job.clientName || 'Not provided'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Location:</span> {job.location || 'Location not set'}
                  </p>
                  {job.note && (
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">Request:</span> {job.note}
                    </p>
                  )}
                </div>
                {job.status === 'Reschedule Requested' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded-md">
                    <CalendarClock size={12} />
                    Reschedule Requested
                  </span>
                )}
                {!isCompany && job.status !== 'Reschedule Requested' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartJob?.(job.id);
                  }}
                  className="w-auto px-6 mt-3 bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
                >
                  Start Job
                </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">{isCompany ? 'Active Assignments' : 'In Progress'}</h2>
        {activeJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
            No active assignments right now.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <article
                key={job.id}
                onClick={() => openActiveJobDetails(job)}
                className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] cursor-pointer hover:shadow-[0_12px_24px_rgba(15,23,42,0.1)] transition"
              >
                {!isCompany ? (
                  <>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold text-sm">Tap to update</span>
                      <span className="text-gray-500 text-xs">{job.time}</span>
                    </div>
                  </>
                ) : (
                  <>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Wrench size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.date} - {job.time}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Clock3 size={12} />
                    Active
                  </span>
                </div>
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    <Users size={12} />
                    {job.assignedWorkerName || (isCompany ? 'Unassigned' : 'You')}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Client:</span> {job.clientName || 'Not provided'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Location:</span> {job.location || 'Location not set'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">Category:</span> {job.category || 'General'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openActiveJobDetails(job);
                  }}
                  className="w-auto px-6 bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-600 transition"
                >
                  {isJobLockedFromClientFlow(job) ? 'View Job Details' : 'Open Full Job Details'}
                </button>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Completed - Awaiting Verification</h2>
        {completedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
            No pending updates.
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.map((job) => (
              <article
                key={job.id}
                onClick={() => openActiveJobDetails(job)}
                className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 cursor-pointer hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition"
              >
                <p className="text-sm font-bold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-500">{job.date} - {job.time}</p>
                <p className="text-xs font-semibold text-gray-600 mt-2">Awaiting client verification</p>
                <p className="text-[11px] text-blue-600 mt-1 font-semibold">View submission details</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Verified Work</h2>
        {verifiedJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
            No verified updates yet.
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-green-100 bg-green-50/60 p-4">
                <p className="text-sm font-bold text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-500">{job.date} - {job.time}</p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 mt-2">
                  <CheckCircle2 size={12} />
                  Verified by client
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedActiveJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center px-3 sm:px-6 py-3 sm:py-6">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {(() => {
              const isCompanyAssignedJob = isCompany && selectedActiveJob.status === 'Assigned';
              const isCompanyAssignedJobLocked = isCompanyAssignedJob && isJobLockedFromClientFlow(selectedActiveJob);
              return (
                <>
            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">{isRescheduling ? 'Request Reschedule' : selectedActiveJob.status === 'Assigned' ? 'Job Details' : 'Active Job Details'}</h3>
              {isCompany && !isCompanyAssignedJob && !isEditingActiveJob && !isRescheduling && selectedActiveJob.status !== 'Reschedule Requested' && !isJobLockedFromClientFlow(selectedActiveJob) ? (
                <button
                  type="button"
                  onClick={() => setIsEditingActiveJob(true)}
                  className="mt-3 w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100"
                >
                  Edit Job Details
                </button>
              ) : isCompany && !isEditingActiveJob && !isCompanyAssignedJob && isJobLockedFromClientFlow(selectedActiveJob) ? (
                <p className="mt-3 text-xs font-semibold text-gray-500 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  This job is closed. Completed/verified/rejected jobs are locked from further edits.
                </p>
              ) : isEditingActiveJob ? (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Editing mode is ON</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveJobDraft({ ...selectedActiveJob });
                        setIsEditingActiveJob(false);
                      }}
                      className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      onClick={saveActiveJobDetails}
                      className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {isRescheduling ? (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-600">Propose a new time or request an extension.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Preferred Date</label>
                  <input
                    type="date"
                    value={rescheduleDraft.date}
                    onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, date: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Preferred Time</label>
                  <input
                    type="text"
                    value={rescheduleDraft.time}
                    onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Reason</label>
                  <textarea
                    value={rescheduleDraft.reason}
                    onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, reason: e.target.value })}
                    placeholder="Why do you need to reschedule?"
                    className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 mb-4">
              {isEditingActiveJob ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={activeJobDraft?.title || ''}
                    onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900"
                    placeholder="Work title"
                  />
                  <input
                    type="text"
                    value={activeJobDraft?.category || ''}
                    onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder="Category"
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-700"
                  />
                </div>
              ) : (
                <>
                  <p className="text-base font-bold text-gray-900">{selectedActiveJob.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedActiveJob.category || 'General'} Service</p>
                </>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-2">
                {selectedActiveJob.status === 'Assigned' ? <CalendarDays size={12} /> : <Clock3 size={12} />}
                {selectedActiveJob.status === 'Assigned' ? 'Scheduled' : 'In Progress'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {isEditingActiveJob ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={activeJobDraft?.date || ''}
                      onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, date: event.target.value }))}
                      placeholder="Date"
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                    />
                    <input
                      type="text"
                      value={activeJobDraft?.time || ''}
                      onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, time: event.target.value }))}
                      placeholder="Time"
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                    />
                  </div>
                  <input
                    type="text"
                    value={activeJobDraft?.location || ''}
                    onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Location"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                  />
                  <input
                    type="text"
                    value={activeJobDraft?.clientName || ''}
                    onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, clientName: event.target.value }))}
                    placeholder="Client name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700 inline-flex items-center gap-2">
                    <CalendarDays size={12} />
                    {selectedActiveJob.date} - {selectedActiveJob.time}
                  </p>
                  <p className="text-sm text-gray-700 inline-flex items-center gap-2">
                    <MapPin size={12} />
                    {selectedActiveJob.location || 'Location not set'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Client:</span> {selectedActiveJob.clientName || 'Not provided'}
                  </p>
                </>
              )}
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Worker:</span> {selectedActiveJob.providerName || 'Not provided'}
              </p>
              {selectedActiveJob.assignedWorkerName && <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Assigned To:</span> {selectedActiveJob.assignedWorkerName}</p>}
            </div>
            {isCompanyAssignedJob && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Assign to:</label>
                <select
                  className={`w-full text-sm border border-gray-200 rounded-lg px-2 py-2 ${isCompanyAssignedJobLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                  value={activeJobDraft?.assignedWorkerId || ''}
                  disabled={isCompanyAssignedJobLocked}
                  onChange={(event) =>
                    setActiveJobDraft((prev) => ({ ...prev, assignedWorkerId: event.target.value }))
                  }
                >
                  <option value="">Select Worker</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-bold text-gray-900">Progress Notes</h4>
              {isCompany && isEditingActiveJob ? (
                <textarea
                  rows={3}
                  value={activeJobDraft?.note || ''}
                  onChange={(event) => setActiveJobDraft((prev) => ({ ...prev, note: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 resize-none"
                  placeholder="Add optional progress notes"
                />
              ) : (
                <p className="text-sm text-gray-600 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  {selectedActiveJob.note || 'No progress note added for this job yet.'}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-bold text-gray-900">Proof Attachments</h4>
              {isWorkerView && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => proofPickerRef.current?.click()}
                    className="w-full px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                  >
                    Upload Proof Images
                  </button>
                  <input
                    ref={proofPickerRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      files.forEach((file) => setProofFromFile(file));
                      event.target.value = '';
                    }}
                  />
                </div>
              )}
              {Array.isArray((isWorkerView ? activeJobDraft?.photos : selectedActiveJob.photos)) &&
              (isWorkerView ? activeJobDraft?.photos : selectedActiveJob.photos).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(isWorkerView ? activeJobDraft.photos : selectedActiveJob.photos).map((photo, index) => (
                    <div key={`${photo}-${index}`} className="rounded-xl border border-gray-200 p-1.5 bg-gray-50">
                      <img
                        src={photo}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {isWorkerView && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveJobDraft((prev) => ({
                              ...prev,
                              photos: (prev.photos || []).filter((_, i) => i !== index)
                            }))
                          }
                          className="mt-1 w-full text-[11px] font-semibold text-red-600 border border-red-200 rounded-md py-1 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No proof images uploaded yet.</p>
              )}
            </div>
              </>
            )}

            <p className="text-sm text-gray-600 mb-4">
              {isRescheduling ? '' : selectedActiveJob.status === 'Assigned' 
                ? isCompany ? 'Assign a worker and save. Saving locks this job and sends it to the worker.' : 'Start this job to begin tracking progress.' 
                : isCompany
                  ? 'Company can update task details here. Worker submits proof for verification.'
                  : 'Submit proof to move this assignment to client verification.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeActiveJobDetails}
                className="w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Close
              </button>

              {isRescheduling ? (
                <button
                  type="button"
                  onClick={() => {
                    onRequestReschedule?.(selectedActiveJob.id, rescheduleDraft);
                    closeActiveJobDetails();
                  }}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition"
                >
                  Send Request
                </button>
              ) : isCompanyAssignedJob ? (
                <button
                  type="button"
                  onClick={saveAssignmentAndClose}
                  disabled={isCompanyAssignedJobLocked}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-60"
                >
                  {isCompanyAssignedJobLocked ? 'Locked' : 'Save'}
                </button>
              ) : (
                <>
              {selectedActiveJob.status === 'Assigned' && isWorkerView && selectedActiveJob.status !== 'Reschedule Requested' ? (
                <>
                <button
                  type="button"
                  onClick={() => {
                    onStartJob?.(selectedActiveJob.id);
                    closeActiveJobDetails();
                  }}
                  className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition"
                >
                  Start Job
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRescheduleDraft({ date: selectedActiveJob.date, time: selectedActiveJob.time, reason: '' });
                    setIsRescheduling(true);
                  }}
                  className="col-span-2 w-full border border-orange-200 text-orange-600 font-semibold py-2.5 rounded-xl hover:bg-orange-50 transition"
                >
                  Request Reschedule
                </button>
                </>
              ) : selectedActiveJob.status !== 'Reschedule Requested' && isWorkerView && (
              <button
                type="button"
                onClick={() => {
                  const photos = Array.isArray(activeJobDraft?.photos) ? activeJobDraft.photos : [];
                  if (photos.length === 0) {
                    window.alert('Upload at least one proof image before submitting.');
                    return;
                  }
                  onUpdateActiveJob?.(selectedActiveJob.id, {
                    photos
                  });
                  onSubmitProgress?.(selectedActiveJob.id);
                  closeActiveJobDetails();
                }}
                className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition"
              >
                Submit Proof
              </button>
              )}
              {isCompany && isEditingActiveJob && !isRescheduling && (
                <button
                  type="button"
                  onClick={() => {
                    saveActiveJobDetails();
                    closeActiveJobDetails();
                  }}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-600 transition"
                >
                  Save Job Details
                </button>
              )}
                </>
              )}
            </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerAssignedWorkScreen;



