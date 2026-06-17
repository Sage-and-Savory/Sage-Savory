import React, { useState } from 'react';
import { ChefHat, ArrowRight, X } from 'lucide-react';
import { useAppStore } from './store';

export function SplashLoginScreen({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  const { signUp, signIn } = useAppStore();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState({ text: '', isError: true });
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthMessage({ text: "Please enter email and password", isError: true });
      return;
    }
    
    setIsLoading(true);
    let error;
    try {
      if (isLoginMode) {
        const res = await signIn(email, password);
        error = res?.error;
      } else {
        const res = await signUp(email, password);
        error = res?.error;
      }
    } catch (e: any) {
      error = e;
    }
    setIsLoading(false);

    if (error) {
      if (typeof error === 'string') {
        setAuthMessage({ text: error, isError: true });
      } else if (error.message) {
        setAuthMessage({ text: error.message, isError: true });
      } else {
        setAuthMessage({ text: "An unknown error occurred during sign in.", isError: true });
      }
    } else {
      if (!isLoginMode) {
        setAuthMessage({ text: "Signed up successfully! Please check your email to verify if required, or log in.", isError: false });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7] dark:bg-[#1C1C1E] p-4 text-[#333333] dark:text-[#E5E5EA]">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#8A9A86]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#C27D5F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm bg-white dark:bg-[#2C2C2E] p-8 rounded-3xl shadow-xl shadow-[#8A9A86]/5 border border-gray-100 dark:border-[#38383A] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#8A9A86]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#8A9A86]/20 shadow-inner">
            <ChefHat className="w-8 h-8 text-[#8A9A86]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">Saga & Savory</h1>
          <p className="text-sm font-medium text-gray-400 text-center">
            Your personal, intelligent kitchen command center.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Email</label>
            <input 
              type="email" 
              placeholder="chef@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setAuthMessage({ text: '', isError: true }); }}
              className="w-full bg-[#FDFBF7] dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#38383A] focus:border-[#8A9A86] focus:ring-1 focus:ring-[#8A9A86]/20 px-4 py-3 rounded-xl font-semibold outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthMessage({ text: '', isError: true }); }}
              className="w-full bg-[#FDFBF7] dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#38383A] focus:border-[#8A9A86] focus:ring-1 focus:ring-[#8A9A86]/20 px-4 py-3 rounded-xl font-semibold outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full relative flex items-center justify-center bg-[#8A9A86] text-white font-extrabold py-3.5 rounded-xl transition-all hover:bg-[#768573] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#8A9A86]/20 overflow-hidden group mt-6"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Processing...' : (isLoginMode ? 'Enter Kitchen' : 'Create Account')}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        {authMessage.text && (
          <div className={`mt-4 p-3 text-xs font-bold rounded-xl text-center border ${
            authMessage.isError 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
          }`}>
            {authMessage.text}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-100 dark:border-[#38383A] pt-6">
          <button 
            type="button"
            onClick={() => { setIsLoginMode(!isLoginMode); setAuthMessage({ text: '', isError: true }); }} 
            className="text-xs font-bold text-gray-500 hover:text-[#8A9A86] transition-colors"
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
          
          <button 
            onClick={onContinueAsGuest}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1 mt-2"
          >
            Continue as guest <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
