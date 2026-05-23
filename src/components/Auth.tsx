import React, { useState } from 'react';
import { Shield, Key, Mail, UserPlus, LogIn, Loader2, Sparkles } from 'lucide-react';

interface AuthProps {
  backendUrl: string;
  onLoginSuccess: (token: string) => void;
  showToast: (msg: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ backendUrl, onLoginSuccess, showToast }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }
      
      if (isLogin) {
        showToast('Logged in successfully!');
        if (data.access_token) {
          onLoginSuccess(data.access_token);
        }
      } else {
        showToast('Account registered successfully! You can now log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Server error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg-base relative overflow-hidden px-4 select-none">
      {/* Decorative neon ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-secondary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none" />
      
      {/* Auth Card wrapper */}
      <div className="w-full max-w-md bg-bg-surface/40 backdrop-blur-xl border border-border-color rounded-2xl p-8 shadow-2xl relative z-10 hover:shadow-accent-glow/20 transition-all duration-500">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20 rounded-2xl mb-4 border border-accent-secondary/30 shadow-inner">
            <Shield className="w-8 h-8 text-accent-secondary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Research Assistant <Sparkles className="w-4 h-4 text-accent-primary" />
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 font-medium">
            {isLogin ? 'Sign in to access your tenant vector store' : 'Create an isolated account to begin research'}
          </p>
        </div>
        
        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in text-center">
              {error}
            </div>
          )}
          
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary tracking-wider uppercase block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4.5 h-4.5 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-surface-elevated/40 border border-border-color focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary text-sm text-white py-3 pl-11 pr-4 rounded-xl outline-none transition-all duration-300 placeholder:text-text-secondary/50 font-medium"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary tracking-wider uppercase block">
              Password
            </label>
            <div className="relative">
              <Key className="w-4.5 h-4.5 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-surface-elevated/40 border border-border-color focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary text-sm text-white py-3 pl-11 pr-4 rounded-xl outline-none transition-all duration-300 placeholder:text-text-secondary/50 font-medium"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-secondary to-accent-primary text-bg-base hover:scale-[1.02] active:scale-[0.98] font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-glow disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In to System
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register Account
              </>
            )}
          </button>
        </form>
        
        {/* Toggle Mode Link */}
        <div className="text-center mt-6 pt-5 border-t border-border-color/60">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-accent-secondary hover:text-accent-primary hover:underline transition-colors duration-200 font-semibold"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
        
      </div>
    </div>
  );
};
export default Auth;
