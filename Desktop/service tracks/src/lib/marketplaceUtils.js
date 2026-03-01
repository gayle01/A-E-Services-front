export const STORAGE_KEY = 'local-marketplace-state-v3';

export const seedNotifications = [
  { id: 1, title: 'Welcome to TrackFlow', body: 'Get started by setting up your profile.', time: 'Now', unread: true }
];

const LEGACY_TEXT_REPLACEMENTS = [
  ['Mabushi, FCT', 'East Legon, Accra'],
  ['Victoria Island', 'Airport Residential, Accra'],
  ['Lekki', 'Kokomlemle, Accra'],
  ['Benin City', 'Accra'],
  ['Abuja', 'Kumasi'],
  ['N.Y Bronx', 'Accra, Ghana']
];

function migrateLegacyText(value) {
  if (typeof value !== 'string') return value;
  return LEGACY_TEXT_REPLACEMENTS.reduce((next, [from, to]) => next.split(from).join(to), value);
}

export function migrateLegacyData(input) {
  if (Array.isArray(input)) return input.map(migrateLegacyData);
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, migrateLegacyData(value)])
    );
  }
  return migrateLegacyText(input);
}

export function formatDateTime(date) {
  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const start = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const end = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return { datePart, timeRange: `${start} - ${end}` };
}

export function addWeeks(date, weeks) {
  return new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function alignToWeekday(date, targetWeekday) {
  if (!Number.isInteger(targetWeekday) || targetWeekday < 0 || targetWeekday > 6) return date;
  const current = date.getDay();
  const delta = (targetWeekday - current + 7) % 7;
  return addDays(date, delta);
}

function formatOccurrenceDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatContractDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function buildYearlyOccurrences(contract, startDate, options = {}) {
  const durationValue = Number(options.durationValue || contract.durationValue || contract.durationMonths || 12);
  const durationUnit = options.durationUnit || contract.durationUnit || 'months';
  const frequency = options.frequency || contract.frequency || 'Weekly';
  const weekday = Number(options.weekday ?? contract.weekday ?? startDate.getDay());
  const durationWeeks =
    durationUnit === 'weeks'
      ? Math.max(1, durationValue)
      : Math.max(1, Math.ceil((durationValue * 52) / 12));
  const weeklyCount = Math.max(1, durationWeeks);
  const count =
    frequency === 'Biweekly'
      ? Math.max(1, Math.ceil(weeklyCount / 2))
      : frequency === 'Monthly'
        ? Math.max(1, durationUnit === 'weeks' ? Math.ceil(durationWeeks / 4.345) : durationValue)
        : weeklyCount;
  const alignedStart = alignToWeekday(startDate, weekday);

  const getOccurrenceDate = (index) => {
    if (frequency === 'Biweekly') return addWeeks(alignedStart, index * 2);
    if (frequency === 'Monthly') return addMonths(alignedStart, index);
    return addWeeks(alignedStart, index);
  };

  return Array.from({ length: count }).map((_, index) => {
    const day = getOccurrenceDate(index);
    const status =
      index < 4
        ? 'Verified'
        : index === 4
          ? 'Rejected'
          : index === 5
            ? 'Submitted'
            : index === 6
              ? 'In Progress'
              : 'Scheduled';

    return {
      id: contract.id * 1000 + index + 1,
      contractId: contract.id,
      title: contract.title,
      dateIso: day.toISOString(),
      dateLabel: formatOccurrenceDate(day),
      time: '08:00 AM - 10:00 AM',
      status,
      note: status === 'Rejected' ? 'Some sections were left unfinished.' : '',
      clientFeedback: status === 'Rejected' ? 'Please re-clean the kitchen and hallway.' : '',
      photos: []
    };
  });
}

export function includesQuery(value, query) {
  return String(value || '').toLowerCase().includes(query.toLowerCase());
}

export function createNameFromEmail(email) {
  const prefix = String(email || '').split('@')[0] || 'User';
  return prefix
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function createStateSnapshot(state) {
  return {
    authUsers: state.authUsers,
    currentUser: state.currentUser,
    pendingWorkerSetupUserId: state.pendingWorkerSetupUserId,
    workerRequests: state.workerRequests,
    jobs: state.jobs,
    contracts: state.contracts,
    occurrences: state.occurrences,
    selectedContractId: state.selectedContractId,
    notifications: state.notifications,
    bookmarkedWorkerIds: state.bookmarkedWorkerIds,
    updatedAt: Date.now()
  };
}

export function getEmptyState() {
  return {
    authUsers: [],
    currentUser: null,
    pendingWorkerSetupUserId: null,
    workerRequests: [],
    jobs: [],
    contracts: [],
    occurrences: [],
    selectedContractId: null,
    notifications: seedNotifications,
    bookmarkedWorkerIds: [],
    updatedAt: 0
  };
}

export function normalizeStoredState(rawState = {}) {
  const data = migrateLegacyData(rawState);
  const empty = getEmptyState();
  return {
    ...empty,
    ...data,
    authUsers: Array.isArray(data.authUsers) ? data.authUsers : empty.authUsers,
    currentUser: data.currentUser?.role === 'guest' ? null : (data.currentUser || null),
    workerRequests: Array.isArray(data.workerRequests) ? data.workerRequests : empty.workerRequests,
    jobs: Array.isArray(data.jobs) ? data.jobs : empty.jobs,
    contracts: Array.isArray(data.contracts) ? data.contracts : empty.contracts,
    occurrences: Array.isArray(data.occurrences) ? data.occurrences : empty.occurrences,
    notifications: Array.isArray(data.notifications) ? data.notifications : empty.notifications,
    bookmarkedWorkerIds: Array.isArray(data.bookmarkedWorkerIds) ? data.bookmarkedWorkerIds : empty.bookmarkedWorkerIds,
    selectedContractId: data.selectedContractId || null,
    updatedAt: Number(data.updatedAt || 0)
  };
}

