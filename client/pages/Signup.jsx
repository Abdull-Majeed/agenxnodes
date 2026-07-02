import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast) setTimeout(() => setToast(null), 3000);
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!creds.username || !creds.password) {
      setToast({ msg: "Please fill in all fields", type: "error" });
      return;
    }
    if (creds.password.length < 4) {
      setToast({ msg: "Password must be at least 4 characters", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/signup`, creds);
      setToast({ msg: res.data.message, type: "success" });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Signup failed. Please try again.";
      setToast({ msg: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toastStyle = toast?.type === "success"
    ? "bg-emerald-600 text-white"
    : toast?.type === "error"
      ? "bg-rose-600 text-white"
      : "bg-indigo-600 text-white";

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg items-center justify-center">
        <div className="glass-panel-strong w-full rounded-3xl border border-white/70 p-8 shadow-glass">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white"
          >
            Back
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-bold uppercase tracking-[0.3em] text-white">
              AX
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.4em] text-slate-500">Get started</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create your AgenXNodes account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Launch AI-driven workflows and automate tasks in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-600">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-glass ${toastStyle}`}>
            <span className="h-2 w-2 rounded-full bg-white/80" />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
