function PromoBanner({ onOpenJobs }) {
  return (
    <div className="rounded-3xl p-6 flex items-center justify-between mb-8 overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 shadow-[0_18px_34px_rgba(15,23,42,0.3)]">
      <div className="z-10 w-2/3">
        <p className="text-xs font-bold text-blue-100 mb-1">#WorkJobs</p>
        <h3 className="text-xl font-extrabold text-white leading-tight mb-4">
          Keep every task transparent from start to verification
        </h3>
        <button
          type="button"
          onClick={onOpenJobs}
          className="bg-white text-slate-900 text-sm font-semibold py-2 px-6 rounded-full hover:bg-slate-100 transition"
        >
          Open jobs
        </button>
      </div>
      <div className="absolute right-[-20px] bottom-0 w-40 h-40 opacity-85">
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop"
          alt="Worker"
          className="w-full h-full object-cover object-top drop-shadow-xl"
        />
      </div>
    </div>
  );
}

export default PromoBanner;
