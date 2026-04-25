'use client';
import { useEffect, useState } from 'react';
import { getProjects, setProjects, getTasks, type Project, type Task } from '@/lib/store';
import { Plus, X, FolderOpen, Circle } from 'lucide-react';

const STATUS_STYLES: Record<Project['status'], string> = {
  active: 'bg-emerald-900 text-emerald-300',
  paused: 'bg-amber-900 text-amber-300',
  done: 'bg-gray-800 text-gray-400',
};

export default function ProjectsPage() {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    setProjectsState(getProjects());
    setTasksState(getTasks());
  }, []);

  function addProject() {
    if (!name.trim()) return;
    const project: Project = {
      id: `p${Date.now()}`, name, description: desc,
      status: 'active', taskIds: [], noteIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [project, ...projects];
    setProjects(updated);
    setProjectsState(updated);
    setName(''); setDesc(''); setShowNew(false);
  }

  function cycleStatus(id: string) {
    const cycle: Project['status'][] = ['active', 'paused', 'done'];
    const updated = projects.map(p => {
      if (p.id !== id) return p;
      const next = cycle[(cycle.indexOf(p.status) + 1) % cycle.length];
      return { ...p, status: next };
    });
    setProjects(updated);
    setProjectsState(updated);
  }

  function deleteProject(id: string) {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    setProjectsState(updated);
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">{projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Project
        </button>
      </div>

      {showNew && (
        <div className="bg-gray-900 border border-violet-700 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-white">New Project</h2>
            <button onClick={() => setShowNew(false)}><X size={14} className="text-gray-400 hover:text-white" /></button>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 outline-none focus:border-violet-500" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 outline-none focus:border-violet-500" />
          <div className="flex justify-end">
            <button onClick={addProject} className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">Create Project</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.project === project.name);
          const doneTasks = projectTasks.filter(t => t.done).length;
          const progress = projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

          return (
            <div key={project.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 cursor-pointer transition-colors" onClick={() => setSelected(project)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-orange-400" />
                  <h3 className="text-sm font-medium text-white">{project.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); cycleStatus(project.id); }}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[project.status]}`}>
                    {project.status}
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteProject(project.id); }} className="text-gray-700 hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description || 'No description'}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-1">
                  <div className="bg-orange-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-gray-500">{doneTasks}/{projectTasks.length} tasks</span>
              </div>
              <p className="text-xs text-gray-600 mt-3">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base font-medium text-white">{selected.name}</h2>
              <button onClick={() => setSelected(null)}><X size={14} className="text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selected.description}</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Linked Tasks</p>
              {tasks.filter(t => t.project === selected.name).map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm text-gray-300">
                  <Circle size={8} className={t.done ? 'text-amber-400' : 'text-gray-600'} fill={t.done ? 'currentColor' : 'none'} />
                  <span className={t.done ? 'line-through text-gray-500' : ''}>{t.title}</span>
                </div>
              ))}
              {tasks.filter(t => t.project === selected.name).length === 0 && (
                <p className="text-xs text-gray-600">No tasks linked yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
