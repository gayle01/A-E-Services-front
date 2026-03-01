import AuthScreen from '../components/AuthScreen';

function AuthPage({ authMode, onAuthenticate, onResetPassword, onBack }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-gray-900 text-center p-6">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900/90"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <AuthScreen
              onAuthenticate={onAuthenticate}
              onResetPassword={onResetPassword}
              initialMode={authMode}
              onBack={onBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
