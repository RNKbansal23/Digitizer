'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, GraduationCap, BookOpen, Sparkles, MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push('/teacher');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-coral-300 bg-[#FF7F50] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-8 right-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>

      {/* Floating Decorative SVGs */}
      <div className="absolute top-1/4 left-10 md:left-32 text-indigo-400/50 animate-float">
        <GraduationCap size={64} strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/3 right-10 md:right-32 text-amber-400/60 animate-float float-delay-1">
        <Sparkles size={48} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/4 left-16 md:left-40 text-sky-400/50 animate-float float-delay-2">
        <BookOpen size={56} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/3 right-16 md:right-40 text-[#FF7F50]/50 animate-float float-delay-3">
        <MessageCircle size={56} strokeWidth={1.5} />
      </div>

      {/* Glassmorphism Login Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-[24px] border border-white/50 shadow-2xl shadow-indigo-900/5 relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">School Saathi</h1>
          <p className="text-slate-500 font-medium text-sm">Welcome back! Let's manage your day.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 bg-white/80 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px] text-slate-900"
                placeholder="teacher@school.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 bg-white/80 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 min-h-[44px] text-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3.5 rounded-xl font-bold mt-4 transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:transform-none min-h-[44px] shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
