function LandingScreen({ onSignIn, onSignUp }) {
  return (
    <div className="min-h-screen p-6 flex flex-col justify-between bg-[radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div>
        <p className="text-xs tracking-[0.16em] font-semibold text-blue-500 mb-3 uppercase">Local Service Marketplace</p>
        <h1 className="text-[34px] font-extrabold text-gray-900 leading-tight mb-3">
          Find trusted workers near you
        </h1>
        <p className="text-sm text-gray-600 max-w-[26ch]">
          Book electricians, plumbers, carpenters and more. Fast, verified, and local.
        </p>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.25)]">
        <p className="text-sm font-semibold text-white mb-1">Get started in seconds</p>
        <p className="text-xs text-slate-200 mb-4">Create an account or sign in to continue.</p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onSignUp}
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-[0_8px_20px_rgba(59,130,246,0.36)]"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="w-full border border-slate-300/50 bg-white text-gray-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingScreen;

