function ContractInviteScreen({
  inviteToken = '',
  invite = null,
  contract = null,
  currentUser = null,
  onSignUp,
  onSignIn,
  onAcceptInvite
}) {
  if (!inviteToken) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">Invite Link Invalid</h1>
          <p className="text-sm text-gray-600 mt-2">This invite link is missing a valid token.</p>
        </div>
      </div>
    );
  }

  if (!invite || !contract) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">Invite Not Found</h1>
          <p className="text-sm text-gray-600 mt-2">This invite does not exist, or has been removed.</p>
        </div>
      </div>
    );
  }

  if (invite.status === 'accepted') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">Invite Already Used</h1>
          <p className="text-sm text-gray-600 mt-2">This invite has already been accepted.</p>
        </div>
      </div>
    );
  }

  const expiresAt = Number(invite.expiresAt || 0);
  const isExpired = expiresAt > 0 && Date.now() > expiresAt;
  if (isExpired || invite.status === 'expired') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">Invite Expired</h1>
          <p className="text-sm text-gray-600 mt-2">Ask the company to generate a new invite link.</p>
        </div>
      </div>
    );
  }

  const isClient = currentUser?.role === 'client';
  const hasSession = Boolean(currentUser);

  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Contract Invite</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{contract.title}</h1>
        <p className="text-sm text-gray-600 mt-2">{contract.location || 'Location not specified'}</p>
        <p className="text-xs text-gray-500 mt-2">From: {contract.companyName || 'Company'}</p>

        {!hasSession && (
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={onSignUp}
              className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
            >
              Sign Up To Accept
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="w-full rounded-xl border border-gray-200 text-gray-700 font-semibold py-3 hover:bg-gray-50 transition"
            >
              Sign In To Accept
            </button>
          </div>
        )}

        {hasSession && !isClient && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-700">Sign in as a client to accept this invite.</p>
          </div>
        )}

        {hasSession && isClient && (
          <button
            type="button"
            onClick={() => onAcceptInvite?.(inviteToken)}
            className="w-full mt-6 rounded-xl bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700 transition"
          >
            Accept Invite
          </button>
        )}
      </div>
    </div>
  );
}

export default ContractInviteScreen;
