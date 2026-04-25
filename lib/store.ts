export type NoteTag = string;

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  createdAt: string;
  updatedAt: string;
  linkedIds: string[];
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  project?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'done';
  taskIds: string[];
  noteIds: string[];
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'summarizer' | 'connector' | 'digest' | 'custom';
  status: 'running' | 'idle' | 'scheduled' | 'unconfigured';
  lastRun?: string;
  schedule?: string;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'note' | 'project' | 'person' | 'topic';
  x: number;
  y: number;
  z: number;
  connections: string[];
}

const NOTES_KEY = 'sb_notes';
const TASKS_KEY = 'sb_tasks';
const PROJECTS_KEY = 'sb_projects';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, val: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
}

export const defaultNotes: Note[] = [
  { id: 'n1', title: 'Getting started with Second Brain', content: 'The PARA method: Projects, Areas, Resources, Archives. Capture everything, then organize.', tags: ['meta', 'productivity'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), linkedIds: ['n2'] },
  { id: 'n2', title: 'Building a knowledge graph', content: 'Nodes represent ideas, people, projects. Edges represent relationships. AI finds hidden links.', tags: ['ai', 'knowledge'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), linkedIds: ['n1'] },
  { id: 'n3', title: 'Daily review ritual', content: 'Capture inbox → process → organize → review. 15 minutes every morning.', tags: ['habits', 'productivity'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), linkedIds: [] },
];

export const defaultTasks: Task[] = [
  { id: 't1', title: 'Set up knowledge graph connections', done: false, createdAt: new Date().toISOString() },
  { id: 't2', title: 'Configure daily digest agent', done: false, createdAt: new Date().toISOString() },
  { id: 't3', title: 'Import existing notes', done: true, createdAt: new Date().toISOString() },
];

export const defaultProjects: Project[] = [
  { id: 'p1', name: 'Second Brain Setup', description: 'Configure all agents and import existing knowledge', status: 'active', taskIds: ['t1', 't2', 't3'], noteIds: ['n1'], createdAt: new Date().toISOString() },
];

export const defaultAgents: Agent[] = [
  { id: 'a1', name: 'Researcher', type: 'researcher', status: 'running', description: 'Searches the web and saves findings as notes', lastRun: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a2', name: 'Summarizer', type: 'summarizer', status: 'running', description: 'Auto-summarizes and tags new notes', lastRun: new Date(Date.now() - 1800000).toISOString() },
  { id: 'a3', name: 'Connector', type: 'connector', status: 'idle', description: 'Finds AI-powered links between notes', lastRun: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a4', name: 'Daily Digest', type: 'digest', status: 'scheduled', description: 'Morning briefing of your knowledge base', schedule: '07:00' },
  { id: 'a5', name: 'Custom Agent', type: 'custom', status: 'unconfigured', description: 'Define your own agent logic and triggers' },
];

export const getNotes = (): Note[] => getItem(NOTES_KEY, defaultNotes);
export const setNotes = (n: Note[]) => setItem(NOTES_KEY, n);
export const getTasks = (): Task[] => getItem(TASKS_KEY, defaultTasks);
export const setTasks = (t: Task[]) => setItem(TASKS_KEY, t);
export const getProjects = (): Project[] => getItem(PROJECTS_KEY, defaultProjects);
export const setProjects = (p: Project[]) => setItem(PROJECTS_KEY, p);
