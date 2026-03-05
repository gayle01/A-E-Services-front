const LOGO_URL = '/images/logo.png';

function WelcomeScreen({ onSignUp, onSignIn }) {
  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2800&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/75"></div>

      <nav className="absolute top-0 left-0 w-full flex items-center justify-between p-6 md:py-8 md:px-12 z-20">
        <img src={LOGO_URL} alt="Taskflow" className="w-20 h-20 object-contain drop-shadow-lg" />
        <h2 className="text-white text-2xl md:text-3xl font-black tracking-[0.1em] uppercase font-serif">Taskflow</h2>
      </nav>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center mt-12">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
          Track worker progress <br className="hidden md:block" /> with confidence.
        </h1>

        <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Workers log updates, clients verify completed work, and every job has a clear record.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button onClick={onSignUp} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Get Started
          </button>
          <button onClick={onSignIn} className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-gray-400 hover:border-blue-300 hover:text-white hover:bg-blue-500/20 text-gray-300 font-semibold rounded-lg transition-colors">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;

