'use client';
import { useEffect, useState } from 'react';
import { getNotes, getTasks, getProjects, defaultAgents, type Note, type Task, type Project, type Agent } from '@/lib/store';
import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-semibold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function AgentBadge({ status }: { status: Agent['status'] }) {
  const map: Record<Agent['status'], string> = {
    running: 'bg-emerald-900 text-emerald-300',
    idle: 'bg-violet-900 text-violet-300',
    scheduled: 'bg-amber-900 text-amber-300',
    unconfigured: 'bg-gray-800 text-gray-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status]}`}>{status}</span>;
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const agents = defaultAgents;

  useEffect(() => {
    setNotes(getNotes());
    setTasks(getTasks());
    setProjects(getProjects());
  }, []);

  const done = tasks.filter(t => t.done).length;
  const active = projects.filter(p => p.status === 'active').length;
  const runningAgents = agents.filter(a => a.status === 'running').length;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs bg-emerald-900 text-emerald-300 px-3 py-1.5 rounded-full">
          <Activity size={11} /> {runningAgents} agents active
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Notes" value={notes.length} sub="ideas captured" color="#7F77DD" />
        <StatCard label="Tasks" value={`${done}/${tasks.length}`} sub="completed" color="#EF9F27" />
        <StatCard label="Projects" value={active} sub="active projects" color="#D85A30" />
        <StatCard label="Graph nodes" value={notes.length * 2 + 12} sub="AI connections" color="#1D9E75" />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Recent Notes</h2>
            <Link href="/notes" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
          </div>
          <div className="space-y-3">
            {notes.slice(0, 4).map(note => (
              <Link key={note.id} href="/notes" className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors block">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{note.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{note.content}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Agents</h2>
            <Link href="/agents" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">Manage <ArrowRight size={11} /></Link>
          </div>
          <div className="space-y-3">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{agent.name}</span>
                <AgentBadge status={agent.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white">Open Tasks</h2>
          <Link href="/tasks" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tasks.filter(t => !t.done).map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
              <div className="w-4 h-4 rounded border border-gray-600 shrink-0" />
              <span className="text-sm text-gray-300 truncate">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
