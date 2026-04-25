'use client';
import { useEffect, useState } from 'react';
import { getTasks, setTasks, getProjects, type Task, type Project } from '@/lib/store';
import { Plus, Check, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');

  useEffect(() => {
    setTasksState(getTasks());
    setProjectsState(getProjects());
  }, []);

  function addTask() {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTitle,
      done: false,
      project: newProject || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    setTasksState(updated);
    setNewTitle('');
    setNewProject('');
  }

  function toggleTask(id: string) {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    setTasksState(updated);
  }

  function deleteTask(id: string) {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    setTasksState(updated);
  }

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'open' ? !t.done : t.done
  );
  const done = tasks.filter(t => t.done).length;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
        <span className="text-sm text-gray-400">{done}/{tasks.length} done</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8">
        <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : '0%' }} />
      </div>

      {/* Add task */}
      <div className="flex gap-3 mb-6">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500"
        />
        <select
          value={newProject}
          onChange={e => setNewProject(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-violet-500"
        >
          <option value="">No project</option>
          {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <button onClick={addTask} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 p-1 rounded-lg w-fit">
        {(['all', 'open', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors capitalize ${filter === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map(task => (
          <div key={task.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${task.done ? 'bg-gray-900/50 border-gray-800/50' : 'bg-gray-900 border-gray-800'}`}>
            <button onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${task.done ? 'bg-amber-500 border-amber-500' : 'border-gray-600 hover:border-amber-400'}`}>
              {task.done && <Check size={11} className="text-white" strokeWidth={3} />}
            </button>
            <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.title}</span>
            {task.project && (
              <span className="text-xs bg-orange-900 text-orange-300 px-2 py-0.5 rounded-full">{task.project}</span>
            )}
            <span className="text-xs text-gray-600">{new Date(task.createdAt).toLocaleDateString()}</span>
            <button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-400 transition-colors ml-1">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-12">No tasks here.</p>
        )}
      </div>
    </div>
  );
}
