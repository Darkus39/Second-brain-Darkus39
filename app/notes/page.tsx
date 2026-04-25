'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getNotes, setNotes, type Note } from '@/lib/store';
import { callClaude } from '@/lib/ai';
import { Plus, X, Loader2 } from 'lucide-react';

function NotesInner() {
  const params = useSearchParams();
  const [notes, setNotesState] = useState<Note[]>([]);
  const [showCapture, setShowCapture] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Note | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setNotesState(getNotes());
    if (params.get('capture') === '1') setShowCapture(true);
  }, [params]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError('');
    let tags: string[] = [];
    try {
      const text = await callClaude(
        `Extract 2-4 short tags and a one-sentence summary for this note. Return JSON only, no markdown:\n{"tags":["..."],"summary":"..."}\n\nTitle: ${title}\n\nContent: ${content}`,
        'Return valid JSON only, no explanation, no markdown fences.'
      );
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      tags = parsed.tags || [];
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'NO_KEY') setError('No API key set.');
      else if (e instanceof Error && e.message === 'INVALID_KEY') setError('Invalid API key.');
      tags = [];
    }

    const note: Note = {
      id: `n${Date.now()}`, title, content, tags,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), linkedIds: [],
    };
    const updated = [note, ...notes];
    setNotes(updated);
    setNotesState(updated);
    setTitle(''); setContent(''); setShowCapture(false);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Notes</h1>
        <button onClick={() => setShowCapture(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Note
        </button>
      </div>

      {showCapture && (
        <div className="bg-gray-900 border border-violet-700 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-white">Quick Capture</h2>
            <button onClick={() => setShowCapture(false)}><X size={14} className="text-gray-400 hover:text-white" /></button>
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 outline-none focus:border-violet-500" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 outline-none focus:border-violet-500 resize-none" />
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">AI will auto-tag and summarize using your API key</p>
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              {loading ? <><Loader2 size={13} className="animate-spin" /> Processing...</> : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {notes.map(note => (
          <div key={note.id} onClick={() => setSelected(note)} className="bg-gray-900 border border-gray-800 hover:border-violet-700 rounded-xl p-4 cursor-pointer transition-colors">
            <h3 className="text-sm font-medium text-white mb-2 truncate">{note.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-3 mb-3">{note.content}</p>
            <div className="flex flex-wrap gap-1">
              {note.tags.map(tag => (
                <span key={tag} className="text-xs bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base font-medium text-white">{selected.title}</h2>
              <button onClick={() => setSelected(null)}><X size={14} className="text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{selected.content}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {selected.tags.map(tag => <span key={tag} className="text-xs bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full">{tag}</span>)}
            </div>
            <p className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return <Suspense><NotesInner /></Suspense>;
}
