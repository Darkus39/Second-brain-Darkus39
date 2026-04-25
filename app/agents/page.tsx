'use client';
import { useState, useEffect, useRef } from 'react';
import { defaultAgents, getNotes, type Agent } from '@/lib/store';
import { callClaude, GEMINI_MODELS, DEFAULT_MODEL, getAgentModel, setAgentModel } from '@/lib/ai';
import { Play, Clock, Settings, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

const AGENT_COLORS: Record<Agent['type'], string> = {
  researcher: '#378ADD',
  summarizer: '#7F77DD',
  connector:  '#1D9E75',
  digest:     '#EF9F27',
  custom:     '#888780',
};

const AGENT_PROMPTS: Record<Agent['type'], (notes: string) => string> = {
  researcher: () => `You are a web research agent. Generate 3 interesting research findings about productivity and knowledge management. Return JSON only:\n{"findings":[{"title":"...","summary":"...","url":"https://example.com"}]}`,
  summarizer: (notes) => `Summarize the key themes across these notes in 3 bullet points:\n\n${notes}\n\nReturn JSON only:\n{"themes":["...","...","..."]}`,
  connector:  (notes) => `Find 3 non-obvious conceptual connections between these notes:\n\n${notes}\n\nReturn JSON only:\n{"connections":[{"from":"...","to":"...","insight":"..."}]}`,
  digest:     (notes) => `Create a morning digest briefing from these notes:\n\n${notes}\n\nReturn JSON only:\n{"greeting":"...","highlights":["..."],"focus":"...","quote":"...","author":"..."}`,
  custom:     () => `Describe 3 creative capabilities a custom AI agent for personal knowledge management could have. Return JSON only:\n{"capabilities":["...","...","..."]}`,
};

function AgentStatusBadge({ status }: { status: Agent['status'] }) {
  const map: Record<Agent['status'], string> = {
    running:      'bg-emerald-900 text-emerald-300',
    idle:         'bg-violet-900 text-violet-300',
    scheduled:    'bg-amber-900 text-amber-300',
    unconfigured: 'bg-gray-800 text-gray-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status]}`}>{status}</span>;
}

// Groups for the dropdown display
function ModelDropdown({ agentId, disabled }: { agentId: string; disabled: boolean }) {
  const [selected, setSelected] = useState(DEFAULT_MODEL);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setSelected(getAgentModel(agentId));
  }, [agentId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!dropRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function openDropdown() {
    if (disabled) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: Math.max(rect.width, 240) });
    }
    setOpen(o => !o);
  }

  function choose(modelId: string) {
    setSelected(modelId);
    setAgentModel(agentId, modelId);
    setOpen(false);
  }

  const label = GEMINI_MODELS.find(m => m.id === selected)?.label ?? selected;

  return (
    <>
      <button
        ref={btnRef}
        onClick={openDropdown}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-700 transition-colors min-w-[230px] justify-between"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{ position: 'absolute', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
          className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-y-auto max-h-72"
        >
          <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gemini Models (Free)</div>
          {GEMINI_MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-gray-700 ${
                m.id === selected ? 'text-violet-300 bg-violet-900/30' : 'text-gray-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function AgentResult({ agentType, result }: { agentType: Agent['type']; result: Record<string, unknown> }) {
  if (agentType === 'researcher' && result.findings) {
    return (
      <div className="space-y-2">
        {(result.findings as { title: string; summary: string; url: string }[]).map((f, i) => (
          <div key={i} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-xs font-medium text-blue-300 mb-1">{f.title}</p>
            <p className="text-xs text-gray-400">{f.summary}</p>
          </div>
        ))}
      </div>
    );
  }
  if (agentType === 'summarizer' && result.themes) {
    return (
      <ul className="space-y-1">
        {(result.themes as string[]).map((t, i) => (
          <li key={i} className="text-xs text-gray-300 flex items-start gap-2"><span className="text-violet-400 mt-0.5">•</span>{t}</li>
        ))}
      </ul>
    );
  }
  if (agentType === 'connector' && result.connections) {
    return (
      <div className="space-y-2">
        {(result.connections as { from: string; to: string; insight: string }[]).map((c, i) => (
          <div key={i} className="text-xs text-gray-300">
            <span className="text-teal-400">{c.from}</span><span className="text-gray-600 mx-1">↔</span><span className="text-teal-400">{c.to}</span>
            <p className="text-gray-500 mt-0.5">{c.insight}</p>
          </div>
        ))}
      </div>
    );
  }
  if (agentType === 'digest') {
    const d = result as { greeting: string; highlights: string[]; focus: string; quote: string; author: string };
    return (
      <div className="space-y-2 text-xs text-gray-300">
        <p className="text-amber-300 font-medium">{d.greeting}</p>
        {d.highlights?.map((h, i) => <p key={i} className="flex gap-2"><span className="text-amber-500">→</span>{h}</p>)}
        {d.focus && <p className="text-gray-400 italic">Focus: {d.focus}</p>}
        {d.quote && <p className="text-gray-500 italic border-l-2 border-gray-700 pl-3">{d.quote}{d.author ? ` — ${d.author}` : ''}</p>}
      </div>
    );
  }
  if (agentType === 'custom' && result.capabilities) {
    return (
      <ul className="space-y-1">
        {(result.capabilities as string[]).map((c, i) => (
          <li key={i} className="text-xs text-gray-300 flex items-start gap-2"><span className="text-gray-500 mt-0.5">→</span>{c}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-1">
      {Object.entries(result).map(([k, v]) => (
        <div key={k} className="text-xs text-gray-400"><span className="text-gray-600">{k}:</span> {Array.isArray(v) ? v.join(', ') : String(v)}</div>
      ))}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  async function runAgent(agent: Agent) {
    if (agent.status === 'unconfigured') { setActiveAgent(agent); return; }
    setRunning(agent.id);
    setErrors(prev => { const n = { ...prev }; delete n[agent.id]; return n; });
    try {
      const notes = getNotes().slice(0, 5).map(n => `${n.title}: ${n.content}`).join('\n\n');
      const prompt = AGENT_PROMPTS[agent.type](notes);
      const model = getAgentModel(agent.id);
      const text = await callClaude(
        prompt,
        'You are an AI agent in a second brain system. Always return valid JSON only, no markdown fences.',
        model,
      );
      setResults(prev => ({ ...prev, [agent.id]: text }));
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, lastRun: new Date().toISOString() } : a));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      const friendly =
        msg === 'INVALID_KEY'             ? 'Invalid API key' :
        msg === 'NO_KEY'                  ? 'No API key set — go to Settings' :
        msg.startsWith('MODEL_NOT_FOUND') ? 'Model unavailable — pick a different one from the dropdown' :
                                            `Agent failed: ${msg}`;
      setErrors(prev => ({ ...prev, [agent.id]: friendly }));
    }
    setRunning(null);
  }

  function parseResult(id: string): Record<string, unknown> | null {
    try { return JSON.parse(results[id]?.replace(/```json|```/g, '').trim() || ''); }
    catch { return null; }
  }

  function saveCustomAgent() {
    setAgents(prev => prev.map(a => a.id === activeAgent?.id ? { ...a, status: 'idle', description: customPrompt || a.description } : a));
    setActiveAgent(null);
    setCustomPrompt('');
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Agents</h1>
        <p className="text-sm text-gray-400 mt-1">AI agents powered by OpenRouter — choose a model per agent</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map(agent => {
          const color = AGENT_COLORS[agent.type];
          const result = parseResult(agent.id);
          const isRunning = running === agent.id;
          const errMsg = errors[agent.id];

          return (
            // No overflow-hidden here — dropdown needs to escape the card
            <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-xl">
              <div className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '20', border: `1px solid ${color}40` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                    <AgentStatusBadge status={agent.status} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{agent.description}</p>
                  {agent.lastRun && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={10} /> Last run: {new Date(agent.lastRun).toLocaleTimeString()}
                    </p>
                  )}
                  {agent.schedule && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={10} /> Scheduled: {agent.schedule} daily
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Model:</span>
                    <ModelDropdown agentId={agent.id} disabled={isRunning} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {agent.status === 'unconfigured' ? (
                    <button onClick={() => setActiveAgent(agent)}
                      className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors">
                      <Settings size={12} /> Configure
                    </button>
                  ) : (
                    <button onClick={() => runAgent(agent)} disabled={isRunning}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
                      {isRunning ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run now</>}
                    </button>
                  )}
                </div>
              </div>

              {result && !errMsg && (
                <div className="border-t border-gray-800 p-5 bg-gray-950 rounded-b-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-emerald-400" /> Last result
                  </p>
                  <AgentResult agentType={agent.type} result={result} />
                </div>
              )}

              {errMsg && (
                <div className="border-t border-gray-800 p-4 bg-gray-950 rounded-b-xl">
                  <p className="text-xs text-red-400 flex items-center gap-1.5"><AlertCircle size={11} /> {errMsg}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeAgent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8" onClick={() => setActiveAgent(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-medium text-white mb-2">Configure {activeAgent.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Describe what this agent should do. It will run using your API key.</p>
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g. Search my notes for patterns related to my goals and suggest actions..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-4 outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveAgent(null)} className="text-sm text-gray-400 hover:text-white px-4 py-2">Cancel</button>
              <button onClick={saveCustomAgent} className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">Save & Enable</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
