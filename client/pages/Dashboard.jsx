import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Operator';

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5005/api/workflows', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkflows(data);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const createNew = async () => {
    const name = prompt("Enter Workflow Name:");
    if (!name) return;
    try {
      const { data } = await axios.post(
        'http://localhost:5005/api/workflows',
        { name, nodes: [], edges: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/editor/${data.id}`);
    } catch (e) {
      alert("Error creating workflow");
    }
  };

  const deleteWorkflow = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    await axios.delete(`http://localhost:5005/api/workflows/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setWorkflows((prev) => prev.filter((w) => w._id !== id));
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" }
  ];

  return (
    <div className="min-h-screen w-full text-slate-900">
      <div className="flex min-h-screen flex-col gap-4 p-4 md:flex-row md:p-6">
        <aside className="glass-panel w-full rounded-3xl p-4 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-64">
          <div className="flex h-full flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-bold uppercase tracking-[0.2em] text-white">
                AX
              </div>
              <div>
                <div className="text-sm font-semibold">AgenXNodes</div>
                <div className="text-xs text-slate-500">Automation Studio</div>
              </div>
            </div>

            <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-soft"
                        : "bg-white/60 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="space-y-2">
              <button
                type="button"
                onClick={createNew}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                New Workflow
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Logout
              </button>
            </div>

            <div className="mt-auto rounded-2xl border border-white/50 bg-white/70 p-4 text-xs text-slate-600 shadow-soft">
              <div className="text-sm font-semibold text-slate-900">Workflow Health</div>
              <div className="mt-1 text-slate-500">Monitor active automations and alerts.</div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-2 text-[11px]">
                <span>Active</span>
                <span className="font-semibold text-slate-900">{workflows.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6">
          <header className="glass-panel-strong rounded-3xl px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Welcome</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Good to see you, {username}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Build, monitor, and scale automation workflows with AI assistance.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Logout
                </button>
                <button
                  type="button"
                  onClick={createNew}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  + New Workflow
                </button>
              </div>
            </div>
          </header>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Your workflows</h2>
                <p className="text-xs text-slate-500">Track status and jump back into automation design.</p>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {loading ? "Loading..." : `${workflows.length} workflows`}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading &&
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="animate-pulse rounded-2xl border border-white/60 bg-white/70 p-5 shadow-soft"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-200/70" />
                    <div className="mt-4 h-4 w-2/3 rounded bg-slate-200/70" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-200/60" />
                    <div className="mt-4 h-8 w-full rounded-xl bg-slate-200/50" />
                  </div>
                ))}

              {!loading && workflows.length === 0 && (
                <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-soft">
                  <div className="text-base font-semibold text-slate-900">No workflows yet</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Create your first workflow and let the AI map the steps for you.
                  </p>
                  <button
                    type="button"
                    onClick={createNew}
                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
                  >
                    Create Workflow
                  </button>
                </div>
              )}

              {!loading &&
                workflows.map((wf) => (
                  <div
                    key={wf._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/editor/${wf._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/editor/${wf._id}`);
                    }}
                    className="group relative cursor-pointer rounded-2xl border border-white/60 bg-white/80 p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glass"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-sm font-semibold text-indigo-600">
                        WF
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{wf.name}</div>
                        <div className="text-xs text-slate-500">
                          Created {new Date(wf.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => deleteWorkflow(wf._id, e)}
                      className="absolute right-4 top-4 rounded-full border border-slate-200/70 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100"
                      aria-label="Delete workflow"
                    >
                      Delete
                    </button>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                      <span>Open to edit</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
