import WorkerSetupScreen from '../components/WorkerSetupScreen';

const LOGO_URL = '/images/logo.png';

function WorkerSetupPage({ services, currentUser, onSave }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-gray-900 p-6">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900/90"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <img src={LOGO_URL} alt="Taskflow" className="w-16 h-16 object-contain drop-shadow-lg mb-4" />
          <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Setup Your Profile</h2>
          <p className="text-gray-300 mt-2">Select your skills to get matched with the right jobs.</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-8">
          <WorkerSetupScreen
            services={services}
            initialSelected={currentUser?.workerCategories || []}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkerSetupPage;
