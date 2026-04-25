'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { getApiKey, setApiKey, hasApiKey } from '@/lib/ai';
import { Key, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';

const KeyCtx = createContext<{ refresh: () => void }>({ refresh: () => {} });
export const useKeyRefresh = () => useContext(KeyCtx);

export default function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHasKey(hasApiKey());
    setReady(true);
  }, []);

  async function save() {
    if (!input.trim().startsWith('sk-or-')) {
      setError('OpenRouter keys start with sk-or-v1-...');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SecondBrain',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (res.status === 401) { setError('Invalid API key.'); setSaving(false); return; }
      setApiKey(input.trim());
      setHasKey(true);
    } catch {
      setError('Could not reach OpenRouter. Check your connection.');
    }
    setSaving(false);
  }

  function refresh() { setHasKey(hasApiKey()); }

  if (!ready) return null;

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-900 rounded-xl flex items-center justify-center">
              <Key size={18} className="text-violet-300" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Second<span className="text-violet-400">Brain</span></h1>
              <p className="text-gray-400 text-xs">Connect a free OpenRouter key to continue</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 text-xs text-gray-400 space-y-2">
            <p className="text-gray-300 font-medium mb-1">100% free — no credit card needed</p>
            <p>• Uses <span className="text-violet-300">Gemini 2.0 Flash</span> via OpenRouter free tier</p>
            <p>• Your key is saved in your browser only</p>
            <p>• Never touches any server except OpenRouter</p>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 mt-3 font-medium">
              Get a free OpenRouter key <ExternalLink size={10} />
            </a>
          </div>

          <div className="relative mb-3">
            <input
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="sk-or-v1-..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500 pr-10"
            />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <button onClick={save} disabled={saving || !input}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">
            {saving ? 'Verifying...' : 'Connect & Enter'}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            Sign up at openrouter.ai → Keys → Create Key → paste above
          </p>
        </div>
      </div>
    );
  }

  return (
    <KeyCtx.Provider value={{ refresh }}>
      {children}
    </KeyCtx.Provider>
  );
}
