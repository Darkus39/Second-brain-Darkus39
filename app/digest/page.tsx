'use client';
import { useState, useEffect } from 'react';
import { getNotes, getTasks } from '@/lib/store';
import { callClaude } from '@/lib/ai';
import { Loader2, RefreshCw, Sun, CheckSquare, Brain, Quote } from 'lucide-react';

interface Digest {
  greeting: string;
  date: string;
  highlights: string[];
  openTasks: string[];
  focus: string;
  quote: string;
  author: string;
  connections: string[];
}

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sb_digest');
    if (saved) {
      try { setDigest(JSON.parse(saved)); setCached(true); } catch {}
    }
  }, []);

  async function generate() {
    setLoading(true);
    setError('');
    const notes = getNotes().slice(0, 6).map(n => `${n.title}: ${n.content}`).join('\n\n');
    const tasks = getTasks().filter(t => !t.done).slice(0, 5).map(t => t.title).join(', ');

    const prompt = `Generate a morning second brain digest for ${new Date().toDateString()}.

Notes:
${notes || 'No notes yet.'}

Open tasks: ${tasks || 'none'}

Return JSON only, no markdown:
{
  "greeting": "Good morning — [one warm personalized sentence]",
  "date": "${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}",
  "highlights": ["insight 1 from notes", "insight 2", "insight 3"],
  "openTasks": ["task 1", "task 2", "task 3"],
  "focus": "One sentence on what to focus on today based on the notes and tasks",
  "quote": "An inspiring quote relevant to the themes",
  "author": "Quote author name",
  "connections": ["non-obvious connection between two ideas", "another interesting link"]
}`;

    try {
      const text = await callClaude(prompt, 'You are a thoughtful second brain assistant. Return valid JSON only, no markdown fences.');
      const parsed: Digest = JSON.parse(text.replace(/```json|```/g, '').trim());
      setDigest(parsed);
      localStorage.setItem('sb_digest', JSON.stringify(parsed));
      setCached(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg === 'INVALID_KEY' ? 'Invalid API key.' : msg === 'NO_KEY' ? 'No API key found.' : 'Failed to generate digest. Try again.');
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Daily Digest</h1>
          <p className="text-sm text-gray-400 mt-1">Your AI morning briefing</p>
        </div>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
            : <><RefreshCw size={14} /> {digest ? 'Regenerate' : 'Generate Digest'}</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-6 text-sm text-red-300">{error}</div>
      )}

      {!digest && !loading && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Sun size={32} className="text-amber-400 mx-auto mb-4" />
          <p className="text-gray-400 text-sm mb-2">No digest yet for today</p>
          <p className="text-gray-600 text-xs">Click Generate to create your morning briefing</p>
        </div>
      )}

      {loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Loader2 size={32} className="text-amber-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-sm">Reading your knowledge base...</p>
        </div>
      )}

      {digest && !loading && (
        <div className="space-y-4">
          {cached && <p className="text-xs text-gray-600 text-right">Cached — regenerate for a fresh digest</p>}

          {/* Header */}
          <div className="bg-gradient-to-br from-amber-950 to-gray-900 border border-amber-900/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sun size={16} className="text-amber-400" />
              <span className="text-xs text-amber-400 uppercase tracking-wider">{digest.date}</span>
            </div>
            <p className="text-white text-base font-medium">{digest.greeting}</p>
          </div>

          {/* Highlights */}
          {digest.highlights?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={14} className="text-violet-400" />
                <h2 className="text-xs text-gray-400 uppercase tracking-wider">Knowledge Highlights</h2>
              </div>
              <ul className="space-y-2">
                {digest.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-violet-500 mt-0.5 shrink-0">→</span>{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tasks */}
          {digest.openTasks?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={14} className="text-amber-400" />
                <h2 className="text-xs text-gray-400 uppercase tracking-wider">Focus Tasks Today</h2>
              </div>
              <ul className="space-y-2">
                {digest.openTasks.map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-4 h-4 rounded border border-amber-700 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Focus */}
          {digest.focus && (
            <div className="bg-gray-900 border border-emerald-900/50 rounded-xl p-5">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Today&apos;s Focus</p>
              <p className="text-sm text-white font-medium">{digest.focus}</p>
            </div>
          )}

          {/* Connections */}
          {digest.connections?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">AI-Found Connections</p>
              <ul className="space-y-2">
                {digest.connections.map((c, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-teal-500 shrink-0 mt-0.5">⟳</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quote */}
          {digest.quote && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Quote size={16} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-300 italic mb-2">{digest.quote}</p>
              {digest.author && <p className="text-xs text-gray-500">— {digest.author}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
