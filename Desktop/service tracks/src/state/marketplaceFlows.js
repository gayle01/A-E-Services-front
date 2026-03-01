import { formatDateTime } from '../lib/marketplaceUtils.js';

export function authenticateUser(state, payload) {
  const { mode, role, email, password } = payload;
  const users = Array.isArray(state.authUsers) ? state.authUsers : [];

  if (mode === 'signup') {
    const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { ok: false, error: 'Email already exists. Please sign in instead.' };
    }
    const user = {
      id: Date.now(),
      email,
      password,
      role,
      name: payload.name,
      phone: '',
      location: '',
      about: '',
      workerCategories: []
    };
    return { ok: true, user, isNewUser: true };
  }

  const found = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password &&
      user.role === role
  );
  if (!found) {
    return { ok: false, error: 'Invalid credentials or role. Check details and try again.' };
  }

  return { ok: true, user: found, isNewUser: false };
}

export function createAssignedJobFromRequest(request, now = new Date()) {
  const { datePart, timeRange } = formatDateTime(now);
  return {
    id: Date.now(),
    title: request.title,
    date: datePart,
    time: timeRange,
    providerName: request.workerName,
    location: request.location,
    rating: '5.0',
    status: 'Assigned',
    providerImage: 'https://i.pravatar.cc/100?img=32',
    clientName: request.clientName
  };
}

export function applyReviewDecision(jobs, selectedReviewJobId, decision, feedback = '') {
  const nextStatus = decision === 'approve' ? 'Verified' : 'Active';
  const feedbackKey = decision === 'approve' ? 'verificationFeedback' : 'rejectionFeedback';
  return jobs.map((job) =>
    job.id === selectedReviewJobId
      ? { ...job, status: nextStatus, [feedbackKey]: feedback || '' }
      : job
  );
}


