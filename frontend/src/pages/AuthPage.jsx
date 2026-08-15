import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ workspaceName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body flex min-h-screen w-full bg-neutral-50">
      <div className="relative hidden w-[42%] flex-col justify-between bg-emerald-950 px-10 py-10 md:flex">
        <div className="font-display text-[13px] tracking-[0.2em] text-emerald-200/70">ATELIER</div>
        <p className="font-display text-[28px] font-medium leading-[1.25] text-emerald-50">
          Every session,
          <br />
          accounted for.
        </p>
        <p className="font-body max-w-[280px] text-[13px] leading-relaxed text-emerald-200/50">
          A private workspace for your cohort — attendance, scheduling, and payments, kept quietly in order.
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-14 md:w-[58%]">
        <div className="mx-auto w-full max-w-[340px]">
          <h1 className="font-display text-[26px] font-medium text-neutral-900">
            {mode === 'login' ? 'Welcome back' : 'Set up your workspace'}
          </h1>

          <div className="font-body mt-8 flex gap-6 border-b border-neutral-200 text-[13px]">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative -mb-px pb-3 font-medium tracking-wide ${
                  mode === m ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
                {mode === m && <span className="absolute inset-x-0 -bottom-px h-[1.5px] bg-emerald-700" />}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <input name="workspaceName" placeholder="Workspace name" value={form.workspaceName} onChange={handleChange} required
                  className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
                <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required
                  className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
              </>
            )}
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
              className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required
              className="w-full border-0 border-b border-neutral-300 bg-transparent py-2 text-[14px] focus:border-emerald-700 focus:outline-none" />

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-md bg-emerald-950 py-3 text-[13px] font-medium text-emerald-50 hover:bg-emerald-900 disabled:opacity-60">
              {loading ? 'Please wait…' : mode === 'login' ? 'Continue' : 'Create workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}