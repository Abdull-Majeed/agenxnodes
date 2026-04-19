import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WandSparkles, Layers3, Cpu, PlugZap, BadgeCheck } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI Workflow Studio",
      description: "Generate multi-step automations with an AI agent and refine them visually."
    },
    {
      title: "Live Execution Signals",
      description: "See status pulses, logs, and outcomes across every node in real time."
    },
    {
      title: "Credential-Safe Design",
      description: "Guide operators to add keys securely with contextual setup prompts."
    },
    {
      title: "Composable Nodes",
      description: "Mix triggers, data transforms, and outputs into a single canvas."
    }
  ];

  const steps = [
    { title: "Describe", body: "Explain the workflow in plain language to get a draft." },
    { title: "Design", body: "Arrange nodes, add conditions, and connect integrations." },
    { title: "Deploy", body: "Run automations and monitor every step with AI diagnostics." }
  ];

  const useCases = [
    "Customer sentiment triage and escalation",
    "Onboarding pipelines with approvals",
    "Data enrichment and routing between tools",
    "Automated reporting and notifications"
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-900">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10">
        <header className="glass-panel flex flex-col gap-6 rounded-3xl border border-indigo-200/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-bold uppercase tracking-[0.3em] text-white">
              AX
            </div>
            <div>
              <div className="text-sm font-semibold">AgenXNodes</div>
              <div className="text-xs text-slate-500">Workflow Agent AI</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Start free
            </button>
          </div>
        </header>

        <section className="grid gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Automation Platform</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Build premium AI workflows with a designer-grade automation studio.
            </h1>
            <p className="mt-4 text-base text-slate-600">
              AgenXNodes combines visual flow design, AI generation, and real-time execution controls
              so teams can orchestrate sophisticated automations in minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Create workspace
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                View dashboard
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Average setup time", value: "7 mins" },
                { label: "Connected tools", value: "40+" },
                { label: "Automation uptime", value: "99.9%" }
              ].map((stat) => (
                <div key={stat.label} className="glass-panel rounded-2xl border border-indigo-200/50 p-4 text-sm">
                  <div className="text-xl font-semibold text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel-strong rounded-3xl border border-indigo-200/60 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Flow</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Prompt to result workflow</h2>
              <p className="mt-2 text-sm text-slate-600">
                Watch every step move in sequence from intent to execution with a clear, animated pipeline.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              View in dashboard
            </button>
          </div>

          <div className="mt-8">
            <div className="relative hidden sm:block">
              <div className="pipeline-track">
                <span className="pipeline-signal" />
                <span className="pipeline-node" style={{ left: '10%' }} />
                <span className="pipeline-node" style={{ left: '30%' }} />
                <span className="pipeline-node" style={{ left: '50%' }} />
                <span className="pipeline-node" style={{ left: '70%' }} />
                <span className="pipeline-node" style={{ left: '90%' }} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              <div className="pipeline-step rounded-2xl border border-indigo-200/50 bg-white/90 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Prompt
                  <WandSparkles className="pipeline-icon h-5 w-5 text-amber-600" strokeWidth={2.6} />
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">User intent</div>
                <div className="mt-1 text-xs text-slate-500">"Summarize new leads"</div>
                <div className="pipeline-action mt-3 text-[11px] font-semibold text-blue-600">
                  Action: tokens are going to node 2
                </div>
              </div>
              <div className="pipeline-step delay-1 rounded-2xl border border-indigo-200/50 bg-white/90 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Tokens
                  <Layers3 className="pipeline-icon h-5 w-5 text-cyan-600" strokeWidth={2.6} />
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">Context prep</div>
                <div className="mt-1 text-xs text-slate-500">Tokenized + routed</div>
                <div className="pipeline-action delay-1 mt-3 text-[11px] font-semibold text-blue-600">
                  Action: piece of tokens going to node 3
                </div>
              </div>
              <div className="pipeline-step delay-2 rounded-2xl border border-indigo-200/50 bg-white/90 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Machine
                  <Cpu className="pipeline-icon h-5 w-5 text-indigo-600" strokeWidth={2.6} />
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">AI working</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                  Processing
                </div>
                <div className="pipeline-action delay-2 mt-3 text-[11px] font-semibold text-blue-600">
                  Action: output moving to node 4
                </div>
              </div>
              <div className="pipeline-step delay-3 rounded-2xl border border-indigo-200/50 bg-white/90 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  API
                  <PlugZap className="pipeline-icon h-5 w-5 text-emerald-600" strokeWidth={2.6} />
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">Integration</div>
                <div className="mt-1 text-xs text-slate-500">Slack + CRM sync</div>
                <div className="pipeline-action delay-3 mt-3 text-[11px] font-semibold text-blue-600">
                  Action: response sent to node 5
                </div>
              </div>
              <div className="pipeline-step delay-4 rounded-2xl border border-indigo-200/50 bg-white/90 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Result
                  <BadgeCheck className="pipeline-icon h-5 w-5 text-emerald-600" strokeWidth={2.6} />
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">Delivered</div>
                <div className="mt-1 text-xs text-slate-500">Alerts sent</div>
                <div className="pipeline-action delay-4 mt-3 text-[11px] font-semibold text-blue-600">
                  Action: success delivered to dashboard
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div className="glass-panel rounded-3xl border border-blue-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(59,130,246,0.12)]">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Why teams choose AgenXNodes</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Designed to feel like modern SaaS</h2>
            <p className="mt-3 text-sm text-slate-600">
              Every screen delivers clarity, motion, and focus. From on-boarding to execution,
              operators stay confident and engaged.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {useCases.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-blue-200/70 bg-white px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel rounded-3xl border border-blue-200/70 bg-white/95 p-6 shadow-[0_10px_24px_rgba(59,130,246,0.1)]">
                <div className="text-sm font-semibold text-slate-900">{feature.title}</div>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel-strong rounded-3xl border border-indigo-200/60 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">How it works</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Three steps to automation</h2>
              <p className="mt-2 text-sm text-slate-600">
                Move from idea to execution with guided AI generation and precise controls.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Start building
            </button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-indigo-200/50 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {index + 1}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{step.title}</div>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="glass-panel rounded-3xl border border-indigo-200/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trust and control</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Built for operational reliability</h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep workflows observable, auditable, and safe with layered guardrails.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Role-based access control",
                "Encrypted credential storage",
                "Execution replay and logs",
                "Versioned workflow history"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-indigo-200/50 bg-white/80 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel-strong rounded-3xl border border-indigo-200/60 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Operator quote</div>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              "We automated an entire onboarding workflow in under an hour with clear AI guidance."
            </p>
            <div className="mt-4 text-sm text-slate-600">— Ops Lead, Growth SaaS</div>
            <div className="mt-6 rounded-2xl border border-indigo-200/50 bg-white/80 p-4 text-xs text-slate-500">
              97% of teams report faster deployment using AgenXNodes.
            </div>
          </div>
        </section>

        <section className="glass-panel-strong rounded-3xl border border-indigo-200/60 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ready to launch</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            Build your next automation in minutes.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join teams using AgenXNodes to orchestrate AI-powered workflows at scale.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Create workspace
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Sign in
            </button>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-3 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <div>© 2026 AgenXNodes. All rights reserved.</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Security</span>
            <span>Status</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
