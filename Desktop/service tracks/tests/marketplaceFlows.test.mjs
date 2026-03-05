import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyReviewDecision,
  authenticateUser,
  createAssignedJobFromRequest
} from '../src/state/marketplaceFlows.js';

test('authenticateUser signup rejects duplicate email', () => {
  const state = {
    authUsers: [{ id: 1, email: 'demo@taskflow.app', password: 'x', role: 'client' }]
  };

  const result = authenticateUser(state, {
    mode: 'signup',
    role: 'client',
    email: 'demo@taskflow.app',
    password: 'secret',
    name: 'Demo User'
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Email already exists/i);
});

test('createAssignedJobFromRequest returns assigned job payload', () => {
  const request = {
    title: 'Electrical',
    workerName: 'Fatima Abdullahi',
    location: 'East Legon, Accra',
    clientName: 'Ama Kusi'
  };

  const result = createAssignedJobFromRequest(request, new Date('2026-01-06T08:00:00Z'));

  assert.equal(result.status, 'Assigned');
  assert.equal(result.providerName, 'Fatima Abdullahi');
  assert.equal(result.clientName, 'Ama Kusi');
});

test('applyReviewDecision marks job as verified', () => {
  const jobs = [{ id: 10, title: 'Office Deep Cleaning', status: 'Completed' }];
  const updated = applyReviewDecision(jobs, 10, 'approve', 'All good');

  assert.equal(updated[0].status, 'Verified');
  assert.equal(updated[0].verificationFeedback, 'All good');
});

