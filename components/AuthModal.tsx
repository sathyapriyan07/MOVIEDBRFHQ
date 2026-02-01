
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, setMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert('Verification email sent!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-[360px] bg-gray-900 rounded-2xl p-6 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-black uppercase tracking-widest text-white mb-8">
          {mode === 'login' ? 'Rarefindshq Login' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] bg-black rounded-full px-6 text-[13px] font-medium text-white focus:outline-none border border-white/5 focus:border-white/20 transition-all"
              placeholder="Email address"
            />
          </div>
          <div className="space-y-1.5">
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] bg-black rounded-full px-6 text-[13px] font-medium text-white focus:outline-none border border-white/5 focus:border-white/20 transition-all"
              placeholder="Password"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full h-[44px] bg-white text-black font-black rounded-full text-[11px] uppercase tracking-widest mt-4 hover:bg-gray-200 transition-all active:scale-95"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Signup" : 'Already a member? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
