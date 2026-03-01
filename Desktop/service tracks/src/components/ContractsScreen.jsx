import { BarChart3, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, CircleX, Clock3, Timer, TriangleAlert, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusTabs = ['All', 'Scheduled', 'In Progress', 'Submitted', 'Verified', 'Rejected', 'Missed'];
const progressSteps = ['Scheduled', 'In Progress', 'Submitted', 'Verified'];
const weekdayOptions = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
];

function statusClasses(status) {
  if (status === 'Verified') return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Submitted') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'In Progress') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'Missed') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

function formatActionTime(isoValue) {
  if (!isoValue) return '';
  try {
    const date = new Date(isoValue);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
}

function frequencyLabel(value) {
  if (value === 'Biweekly') return 'Every 2 weeks';
  if (value === 'Monthly') return 'Once a month';
  return 'Every week';
}

function ContractsScreen({
  role,
  contracts = [],
  occurrences = [],
  initialExpandedOccurrenceId = null,
  onFocusedOccurrenceHandled,
  workerOptions = [],
  selectedContractId,
  onSelectContract,
  onCreateYearlyContract,
  onDeleteContract,
  onStartOccurrence,
  onSubmitOccurrence,
  onApproveOccurrence,
  onRejectOccurrence,
  onMarkMissed
}) {
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeMonth, setActiveMonth] = useState('All');
  const [feedbackByOccurrence, setFeedbackByOccurrence] = useState({});
  const [workerDrafts, setWorkerDrafts] = useState({});
  const [actionFeedbackByOccurrence, setActionFeedbackByOccurrence] = useState({});
  const [processingOccurrenceId, setProcessingOccurrenceId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDurationValue, setCreateDurationValue] = useState('12');
  const [createDurationUnit, setCreateDurationUnit] = useState('months');
  const [createFrequency, setCreateFrequency] = useState('Weekly');
  const [createWeekday, setCreateWeekday] = useState('2');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createWorkerName, setCreateWorkerName] = useState(workerOptions[0] || '');
  const [createLocation, setCreateLocation] = useState('');
  const [createError, setCreateError] = useState('');
  const [expandedOccurrenceId, setExpandedOccurrenceId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const getWorkerDraft = (occurrence) => {
    const legacyPhotos = [occurrence.beforePhotoUrl, occurrence.afterPhotoUrl].filter(Boolean);
    return {
      note: occurrence.note || '',
      photos: Array.isArray(occurrence.photos) ? occurrence.photos : legacyPhotos,
      ...(workerDrafts[occurrence.id] || {})
    };
  };

  const setWorkerDraftField = (occurrenceId, field, value) => {
    setWorkerDrafts((prev) => ({
      ...prev,
      [occurrenceId]: {
        ...(prev[occurrenceId] || {}),
        [field]: value
      }
    }));
  };

  const setProofFromFile = (occurrenceId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      setWorkerDrafts((prev) => {
        const prior = prev[occurrenceId] || {};
        const existing = Array.isArray(prior.photos) ? prior.photos : [];
        return {
          ...prev,
          [occurrenceId]: {
            ...prior,
            photos: [...existing, dataUrl]
          }
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const setActionFeedback = (occurrenceId, message) => {
    setActionFeedbackByOccurrence((prev) => ({
      ...prev,
      [occurrenceId]: message
    }));
  };

  const runOccurrenceAction = (occurrenceId, action, successMessage) => {
    setProcessingOccurrenceId(occurrenceId);
    setTimeout(() => {
      action?.();
      setActiveStatus('All');
      setActionFeedback(occurrenceId, successMessage);
      setProcessingOccurrenceId(null);
    }, 260);
  };

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId) || null,
    [contracts, selectedContractId]
  );

  const monthOptions = useMemo(() => {
    const values = new Set();
    occurrences.forEach((occurrence) => {
      if (!occurrence.dateIso) return;
      const date = new Date(occurrence.dateIso);
      values.add(
        date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })
      );
    });
    return ['All', ...Array.from(values)];
  }, [occurrences]);

  const filteredOccurrences = useMemo(() => {
    const byStatus =
      activeStatus === 'All'
        ? occurrences
        : occurrences.filter((occurrence) => occurrence.status === activeStatus);

    const byMonth =
      activeMonth === 'All'
        ? byStatus
        : byStatus.filter((occurrence) => {
            if (!occurrence.dateIso) return false;
            const monthLabel = new Date(occurrence.dateIso).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            });
            return monthLabel === activeMonth;
          });

    return [...byMonth].sort((a, b) => new Date(b.dateIso) - new Date(a.dateIso));
  }, [occurrences, activeStatus, activeMonth]);
  const visibleOccurrences = useMemo(
    () => filteredOccurrences.slice(0, visibleCount),
    [filteredOccurrences, visibleCount]
  );

  const analytics = useMemo(() => {
    const total = occurrences.length;
    const verified = occurrences.filter((occurrence) => occurrence.status === 'Verified').length;
    const rejected = occurrences.filter((occurrence) => occurrence.status === 'Rejected').length;
    const missed = occurrences.filter((occurrence) => occurrence.status === 'Missed').length;
    const successRate = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, rejected, missed, successRate };
  }, [occurrences]);

  const createSummary = useMemo(() => {
    const duration = Number(createDurationValue || 0);
    const day = weekdayOptions.find((item) => item.value === String(createWeekday))?.label || 'selected day';
    if (!duration || duration <= 0) return '';
    const unitLabel = duration === 1 ? createDurationUnit.slice(0, -1) : createDurationUnit;
    return `${frequencyLabel(createFrequency)}, on ${day}, for ${duration} ${unitLabel}.`;
  }, [createDurationValue, createDurationUnit, createFrequency, createWeekday]);

  useEffect(() => {
    if (initialExpandedOccurrenceId) return;
    setExpandedOccurrenceId(null);
    setVisibleCount(8);
  }, [selectedContractId, activeStatus, activeMonth, initialExpandedOccurrenceId]);

  useEffect(() => {
    if (!initialExpandedOccurrenceId) return;
    const target = occurrences.find((occurrence) => occurrence.id === initialExpandedOccurrenceId);
    if (!target) return;
    setActiveMonth('All');
    setActiveStatus('Submitted');
    setVisibleCount(1000);
    setExpandedOccurrenceId(initialExpandedOccurrenceId);
    onFocusedOccurrenceHandled?.();
  }, [initialExpandedOccurrenceId, occurrences, onFocusedOccurrenceHandled]);

  return (
    <div className="p-6 pb-24">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Yearly Contracts</h1>
          <p className="text-sm text-gray-500">
            Track every occurrence, verify outcomes, and flag unsuccessful work.
          </p>
        </div>
        {(role === 'client' || role === 'company') && (
          <button
            type="button"
            onClick={() => {
              setCreateError('');
              setShowCreateForm((prev) => !prev);
            }}
            className="text-xs font-semibold bg-blue-500 text-white px-3 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            {showCreateForm ? 'Close Form' : 'New Contract'}
          </button>
        )}
      </div>

      {(role === 'client' || role === 'company') && showCreateForm && (
        <section className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 space-y-3">
          <p className="text-sm font-bold text-gray-900">Create Contract</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-gray-700">Contract Name</label>
              <input
                type="text"
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                placeholder="e.g. Estate Cleaning Plan"
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Duration</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="number"
                  min="1"
                  value={createDurationValue}
                  onChange={(event) => setCreateDurationValue(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                />
                <select
                  value={createDurationUnit}
                  onChange={(event) => setCreateDurationUnit(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <option value="months">Months</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Frequency</label>
              <select
                value={createFrequency}
                onChange={(event) => setCreateFrequency(event.target.value)}
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="Weekly">Every week (Weekly)</option>
                <option value="Biweekly">Every 2 weeks (Biweekly)</option>
                <option value="Monthly">Once per month (Monthly)</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                `Weekly` = every week. `Biweekly` = every two weeks.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Service Day</label>
              <select
                value={createWeekday}
                onChange={(event) => setCreateWeekday(event.target.value)}
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                {weekdayOptions.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                value={createStartDate}
                onChange={(event) => setCreateStartDate(event.target.value)}
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Worker</label>
              <select
                value={createWorkerName}
                onChange={(event) => setCreateWorkerName(event.target.value)}
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                {workerOptions.length === 0 ? (
                  <option value="">No workers</option>
                ) : (
                  workerOptions.map((workerName) => (
                    <option key={workerName} value={workerName}>
                      {workerName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-gray-700">Location</label>
              <input
                type="text"
                value={createLocation}
                onChange={(event) => setCreateLocation(event.target.value)}
                placeholder="e.g. East Legon, Accra"
                className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
          </div>
          {createSummary && (
            <p className="text-xs text-gray-700 bg-white/80 border border-gray-200 rounded-lg px-3 py-2">
              Plan summary: {createSummary}
            </p>
          )}
          {createError && <p className="text-xs font-semibold text-red-600">{createError}</p>}
          <button
            type="button"
            onClick={() => {
              if (!createTitle.trim()) {
                setCreateError('Please add a contract name.');
                return;
              }
              if (!createDurationValue || Number(createDurationValue) <= 0) {
                setCreateError('Please set a valid duration.');
                return;
              }
              if (!createStartDate) {
                setCreateError('Please select a start date.');
                return;
              }
              if (!createWorkerName.trim()) {
                setCreateError('Please select a worker.');
                return;
              }
              setCreateError('');
              onCreateYearlyContract?.({
                title: createTitle,
                durationValue: Number(createDurationValue),
                durationUnit: createDurationUnit,
                frequency: createFrequency,
                weekday: Number(createWeekday),
                startDate: createStartDate,
                workerName: createWorkerName,
                location: createLocation
              });
              setShowCreateForm(false);
              setCreateTitle('');
              setCreateDurationValue('12');
              setCreateDurationUnit('months');
              setCreateFrequency('Weekly');
              setCreateWeekday('2');
              setCreateStartDate('');
              setCreateWorkerName(workerOptions[0] || '');
              setCreateLocation('');
            }}
            className="w-full bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-600 transition"
          >
            Create Contract
          </button>
        </section>
      )}

      <section className="mb-5 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-blue-500" />
          <p className="text-sm font-bold text-gray-900">Failure Analytics</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-xl bg-gray-50 p-2">
            <p className="text-[11px] text-gray-500">Total</p>
            <p className="text-sm font-bold text-gray-900">{analytics.total}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-2">
            <p className="text-[11px] text-green-600">Verified</p>
            <p className="text-sm font-bold text-green-700">{analytics.verified}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-2">
            <p className="text-[11px] text-red-600">Rejected</p>
            <p className="text-sm font-bold text-red-700">{analytics.rejected}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-2">
            <p className="text-[11px] text-blue-600">Missed</p>
            <p className="text-sm font-bold text-blue-700">{analytics.missed}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">Success rate: {analytics.successRate}% verified occurrences</p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Contract</h2>
        {contracts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
            No yearly contract yet.
          </div>
        ) : (
          <div className="space-y-2">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => onSelectContract?.(contract.id)}
                className={`w-full text-left rounded-2xl border p-3 transition cursor-pointer ${
                  contract.id === selectedContractId
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-white bg-white/85 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{contract.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{contract.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {contract.startDate} - {contract.endDate} · {frequencyLabel(contract.frequency)}
                    </p>
                    {Number.isInteger(Number(contract.weekday)) && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        Service day: {weekdayOptions.find((item) => item.value === String(contract.weekday))?.label || 'Not set'}
                      </p>
                    )}
                    {role === 'company' && (
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <User size={10} /> {contract.workerName}
                      </p>
                    )}
                  </div>
                  {(role === 'client' || role === 'company') && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        const confirmed = window.confirm(`Delete "${contract.title}"? This also removes all occurrences.`);
                        if (!confirmed) return;
                        onDeleteContract?.(contract.id);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedContract && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-gray-700">Occurrence Timeline</h2>
            <select
              value={activeMonth}
              onChange={(event) => setActiveMonth(event.target.value)}
              className="text-xs border border-gray-200 rounded-lg bg-white px-2 py-1.5"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {statusTabs.map((tab) => {
              const active = tab === activeStatus;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveStatus(tab)}
                  className={`whitespace-nowrap text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
                    active
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {filteredOccurrences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 bg-white/80">
              No occurrences for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500">
                Showing {Math.min(visibleCount, filteredOccurrences.length)} of {filteredOccurrences.length} occurrences
              </p>
              {visibleOccurrences.map((occurrence) => {
                const feedback = feedbackByOccurrence[occurrence.id] || '';
                const canWorkerStart = role === 'worker' && occurrence.status === 'Scheduled';
                const canWorkerSubmit = role === 'worker' && ['In Progress', 'Rejected'].includes(occurrence.status);
                const canClientVerify = role === 'client' && occurrence.status === 'Submitted';
                const canClientMarkMissed = role === 'client' && ['Scheduled', 'In Progress'].includes(occurrence.status);
                const workerDraft = getWorkerDraft(occurrence);
                const currentStepIndex = progressSteps.indexOf(occurrence.status);
                const isFailedState = ['Rejected', 'Missed'].includes(occurrence.status);
                const isProcessing = processingOccurrenceId === occurrence.id;
                const isExpanded = expandedOccurrenceId === occurrence.id;

                return (
                  <article key={occurrence.id} className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{occurrence.title || selectedContract.title}</p>
                        <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                          <CalendarDays size={12} />
                          {occurrence.dateLabel} · {occurrence.time}
                        </p>
                        {role === 'company' && selectedContract?.workerName && (
                          <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1 ml-2">
                            <User size={12} /> {selectedContract.workerName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${statusClasses(occurrence.status)}`}>
                          {occurrence.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedOccurrenceId((prev) => (prev === occurrence.id ? null : occurrence.id))}
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="grid grid-cols-4 gap-1">
                        {progressSteps.map((step, index) => {
                          const active = !isFailedState && currentStepIndex >= 0 && index <= currentStepIndex;
                          return (
                            <div
                              key={step}
                              className={`h-1.5 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`}
                              title={step}
                            />
                          );
                        })}
                      </div>
                      {isFailedState && (
                        <p className="text-[11px] text-red-600 mt-1">
                          This occurrence is in a failed state and needs correction.
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{occurrence.note || 'No note submitted yet.'}</p>
                    {!isExpanded && (
                      <p className="text-[11px] text-gray-500 mb-2">Tap the arrow to open full details and actions.</p>
                    )}
                    {isExpanded && (
                      <>
                    {(occurrence.startedAt || occurrence.submittedAt || occurrence.verifiedAt || occurrence.rejectedAt || occurrence.missedAt) && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 mb-2 space-y-0.5">
                        {occurrence.startedAt && (
                          <p className="text-[11px] text-gray-600">Started: {formatActionTime(occurrence.startedAt)}</p>
                        )}
                        {occurrence.submittedAt && (
                          <p className="text-[11px] text-gray-600">Submitted: {formatActionTime(occurrence.submittedAt)}</p>
                        )}
                        {occurrence.verifiedAt && (
                          <p className="text-[11px] text-green-700">Verified: {formatActionTime(occurrence.verifiedAt)}</p>
                        )}
                        {occurrence.rejectedAt && (
                          <p className="text-[11px] text-red-700">Rejected: {formatActionTime(occurrence.rejectedAt)}</p>
                        )}
                        {occurrence.missedAt && (
                          <p className="text-[11px] text-blue-700">Marked missed: {formatActionTime(occurrence.missedAt)}</p>
                        )}
                      </div>
                    )}
                    {occurrence.clientFeedback && (
                      <p className="text-xs text-gray-700 mb-2">
                        <span className="font-semibold">Feedback:</span> {occurrence.clientFeedback}
                      </p>
                    )}
                    {actionFeedbackByOccurrence[occurrence.id] && (
                      <p className="text-[11px] text-emerald-700 mb-2 font-semibold">
                        {actionFeedbackByOccurrence[occurrence.id]}
                      </p>
                    )}
                    {isProcessing && (
                      <p className="text-[11px] text-blue-700 mb-2 font-semibold">
                        Applying action...
                      </p>
                    )}

                    {(() => {
                      const occurrencePhotos =
                        Array.isArray(occurrence.photos) && occurrence.photos.length > 0
                          ? occurrence.photos
                          : [occurrence.beforePhotoUrl, occurrence.afterPhotoUrl].filter(Boolean);
                      return occurrencePhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                        {occurrencePhotos.map((photo, index) => (
                          <div key={`${occurrence.id}-${index}`} className="rounded-xl border border-gray-200 p-1.5 bg-gray-50">
                            <img
                              src={photo}
                              alt={`Proof ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                      ) : null;
                    })()}

                    {(canClientVerify || canClientMarkMissed) && (
                      <textarea
                        rows={2}
                        value={feedback}
                        onChange={(event) =>
                          setFeedbackByOccurrence((prev) => ({
                            ...prev,
                            [occurrence.id]: event.target.value
                          }))
                        }
                        placeholder="Optional comment (reason/feedback)"
                        className="w-full mb-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 resize-none"
                      />
                    )}

                    {canWorkerSubmit && (
                      <div className="space-y-2 mb-2">
                        <textarea
                          rows={2}
                          value={workerDraft.note}
                          onChange={(event) => setWorkerDraftField(occurrence.id, 'note', event.target.value)}
                          placeholder="Progress note (optional)"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 resize-none"
                        />
                        <div className="rounded-xl border border-gray-200 p-2 bg-gray-50 space-y-2">
                          <label className="text-[11px] font-semibold text-gray-700">Proof Images</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="w-full text-[11px] text-gray-500"
                            onChange={(event) => {
                              Array.from(event.target.files || []).forEach((file) => setProofFromFile(occurrence.id, file));
                              event.target.value = '';
                            }}
                          />
                          {Array.isArray(workerDraft.photos) && workerDraft.photos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {workerDraft.photos.map((photo, index) => (
                                <div key={`${occurrence.id}-draft-${index}`} className="rounded-md border border-gray-200 bg-white p-1">
                                  <img src={photo} alt={`Proof preview ${index + 1}`} className="w-full h-16 object-cover rounded" />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setWorkerDraftField(
                                        occurrence.id,
                                        'photos',
                                        workerDraft.photos.filter((_, i) => i !== index)
                                      )
                                    }
                                    className="mt-1 w-full text-[10px] font-semibold text-red-600 border border-red-200 rounded py-0.5 hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500">No proof images selected yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {canWorkerStart && (
                        <button
                          type="button"
                          onClick={() => {
                            runOccurrenceAction(
                              occurrence.id,
                              () => onStartOccurrence?.(occurrence.id),
                              'Started. Status moved to In Progress.'
                            );
                          }}
                          disabled={isProcessing}
                          className="col-span-2 bg-slate-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60"
                        >
                          Start Work
                        </button>
                      )}

                      {canWorkerSubmit && (
                        <button
                          type="button"
                          onClick={() => {
                            const photos = workerDraft.photos || [];
                            if (photos.length === 0) {
                              window.alert('Upload at least one proof image before submitting.');
                              return;
                            }
                            runOccurrenceAction(
                              occurrence.id,
                              () =>
                                onSubmitOccurrence?.(occurrence.id, {
                                  note: workerDraft.note,
                                  photos
                                }),
                              'Submitted. Waiting for client verification.'
                            );
                          }}
                          disabled={isProcessing}
                          className="col-span-2 bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60"
                        >
                          Submit For Verification
                        </button>
                      )}

                      {canClientVerify && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              runOccurrenceAction(
                                occurrence.id,
                                () => onApproveOccurrence?.(occurrence.id, feedback),
                                'Approved and marked as Verified.'
                              );
                            }}
                            disabled={isProcessing}
                            className="bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-emerald-700 inline-flex items-center justify-center gap-1 disabled:opacity-60"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              runOccurrenceAction(
                                occurrence.id,
                                () => onRejectOccurrence?.(occurrence.id, feedback),
                                'Rejected. Worker needs to update and resubmit.'
                              );
                            }}
                            disabled={isProcessing}
                            className="bg-red-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-red-700 inline-flex items-center justify-center gap-1 disabled:opacity-60"
                          >
                            <CircleX size={13} /> Reject
                          </button>
                        </>
                      )}

                      {canClientMarkMissed && (
                        <button
                          type="button"
                          onClick={() => {
                            runOccurrenceAction(
                              occurrence.id,
                              () => onMarkMissed?.(occurrence.id, feedback),
                              'Marked as missed.'
                            );
                          }}
                          disabled={isProcessing}
                          className="col-span-2 border border-blue-200 text-blue-700 bg-blue-50 text-xs font-semibold py-2 rounded-lg hover:bg-blue-100 inline-flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          <TriangleAlert size={13} /> Mark as Missed
                        </button>
                      )}

                      {!canWorkerStart && !canWorkerSubmit && !canClientVerify && !canClientMarkMissed && (
                        <div className="col-span-2 text-[11px] text-gray-500 inline-flex items-center gap-1">
                          <Clock3 size={12} />
                          <Timer size={12} /> No actions available for this status.
                        </div>
                      )}
                    </div>
                      </>
                    )}
                  </article>
                );
              })}
              {visibleCount < filteredOccurrences.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="w-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                >
                  Load 8 More
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default ContractsScreen;


