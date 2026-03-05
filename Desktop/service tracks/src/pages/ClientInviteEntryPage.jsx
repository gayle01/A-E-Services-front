import { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';

function extractInviteToken(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const marker = '/invite/';
  const markerIndex = raw.lastIndexOf(marker);
  if (markerIndex >= 0) {
    return decodeURIComponent(raw.slice(markerIndex + marker.length).split('?')[0].split('#')[0]).trim();
  }
  return raw;
}

function ClientInviteEntryPage({ onApplyInvite, onSkip }) {
  const [inviteInput, setInviteInput] = useState('');
  const [error, setError] = useState('');

  const applyInvite = () => {
    const token = extractInviteToken(inviteInput);
    if (!token) {
      setError('Enter a valid invite code or invite link.');
      return;
    }
    const accepted = onApplyInvite?.(token);
    if (accepted) {
      setError('');
      return;
    }
    setError('Invite code is invalid or already used.');
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden screen-scroll">
      <div className="p-6 md:p-8 pb-24">
        <section className="max-w-2xl mx-auto rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-[0_14px_30px_rgba(37,99,235,0.14)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1">
            <KeyRound size={14} />
            Optional Step
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-3">Do you have a contract invite code?</h1>
          <p className="text-sm text-slate-600 mt-2">
            Paste it below to open your contract directly. If you do not have one, skip and continue to your home page.
          </p>

          <div className="mt-5">
            <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-wide mb-1">Invite Code</label>
            <input
              type="text"
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value)}
              placeholder="Paste invite link or code"
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyInvite}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-blue-700 transition"
            >
              Open Contract
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-4 py-2.5 hover:bg-gray-50 transition"
            >
              Skip for now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ClientInviteEntryPage;
