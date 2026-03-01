import {
  STORAGE_KEY,
  getEmptyState,
  migrateLegacyData,
  normalizeStoredState
} from './marketplaceUtils';

const API_BASE = String(import.meta.env.VITE_STATE_API_BASE || '').trim();

function stateEndpoint() {
  if (!API_BASE) return null;
  return `${API_BASE.replace(/\/$/, '')}/state/${encodeURIComponent(STORAGE_KEY)}`;
}

export function loadStateFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyState();
    return normalizeStoredState(JSON.parse(raw));
  } catch {
    return getEmptyState();
  }
}

export function saveStateToLocal(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore local write errors, app remains usable in-memory.
  }
}

export async function loadState() {
  const endpoint = stateEndpoint();
  if (endpoint) {
    try {
      const response = await fetch(endpoint, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const payload = data?.state || data || {};
        return normalizeStoredState(migrateLegacyData(payload));
      }
    } catch {
      // Fallback to local state below.
    }
  }
  return loadStateFromLocal();
}

export async function saveState(snapshot) {
  const endpoint = stateEndpoint();
  let remoteSaved = false;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: snapshot })
      });
      remoteSaved = response.ok;
    } catch {
      remoteSaved = false;
    }
  }

  if (!remoteSaved || !endpoint) {
    saveStateToLocal(snapshot);
    return;
  }

  // Keep local cache warm even when backend succeeds.
  saveStateToLocal(snapshot);
}

