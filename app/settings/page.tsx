'use client';
import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, hasApiKey } from '@/lib/ai';
import { Key, Eye, EyeOff, Trash2, CheckCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const k = getApiKey();
    if (k) setCurrentKey(k.slice(0, 10) + '•'.repeat(20));
  }, []);

  async function handleSave() {
    if (!newKey.trim().startsWith('AIza')) {
      setErrorMsg('Gemini API keys start with AIza...');
      setStatus('error');
      return;
    }
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${newKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }),
        }
      );
      if (res.status === 403 || res.status === 400) {
        setErrorMsg('Invalid API key.');
        setStatus('error');
        return;
      }
      setApiKey(newKey.trim());
      setCurrentKey(newKey.trim().slice(0, 10) + '•'.repeat(20));
      setNewKey('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setErrorMsg('Could not reach Gemini API. Check your connection.');
      setStatus('error');
    }
  }

  function handleClear() {
    if (!confirm('Remove your API key? You will need to re-enter it.')) return;
    localStorage.removeItem('sb_api_key');
    localStorage.removeItem('sb_digest');
    window.location.reload();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your second brain configuration</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Key size={15} className="text-violet-400" />
          <h2 className="text-sm font-medium text-white">Gemini API Key</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">Stored in your browser only. All AI calls go directly to Google.</p>

        {hasApiKey() && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-400 font-mono mb-4 flex items-center justify-between">
            <span>{currentKey}</span>
            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          </div>
        )}

        <div className="relative mb-3">
          <input
            type={show ? 'text' : 'password'}
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={hasApiKey() ? 'Enter new key to replace...' : 'AIzaSy...'}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500 pr-10"
          />
          <button onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {status === 'error' && <p className="text-xs text-red-400 mb-3">{errorMsg}</p>}
        {status === 'success' && <p className="text-xs text-emerald-400 mb-3 flex items-center gap-1"><CheckCircle size={11} /> Key updated successfully</p>}

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={!newKey || status === 'saving'}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            {status === 'saving' ? 'Verifying...' : 'Update Key'}
          </button>
          {hasApiKey() && (
            <button onClick={handleClear} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-900 hover:border-red-700 transition-colors">
              <Trash2 size={13} /> Remove Key
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium text-white mb-3">About Gemini free tier</h2>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">•</span>4 free models: <span className="text-gray-300 font-medium">Gemini 2.5 Flash, 2.5 Flash Lite, 2.0 Flash, 2.0 Flash Lite</span></li>
          <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">•</span>No credit card required — just a Google account</li>
          <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">•</span>Stable models — won&apos;t get randomly removed</li>
          <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0">•</span>Pick a different model per agent on the Agents page</li>
        </ul>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 mt-4">
          <ExternalLink size={11} /> Get your free key at aistudio.google.com/apikey
        </a>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-medium text-white mb-1">Local Data</h2>
        <p className="text-xs text-gray-500 mb-4">All notes, tasks, and projects are saved in your browser&apos;s localStorage.</p>
        <button onClick={() => {
          if (!confirm('Delete ALL notes, tasks, projects and digest? Cannot be undone.')) return;
          ['sb_notes', 'sb_tasks', 'sb_projects', 'sb_digest'].forEach(k => localStorage.removeItem(k));
          window.location.href = '/';
        }}
          className="text-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-900 hover:border-red-700 transition-colors flex items-center gap-1.5">
          <Trash2 size={13} /> Clear All Data
        </button>
      </div>
    </div>
  );
}
