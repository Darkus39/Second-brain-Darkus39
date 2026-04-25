'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, GitFork, FileText, CheckSquare, FolderOpen, Bot, Newspaper, Zap, Settings } from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: Brain, color: '#7F77DD' },
  { href: '/graph', label: 'Knowledge Graph', icon: GitFork, color: '#1D9E75' },
  { href: '/notes', label: 'Notes', icon: FileText, color: '#378ADD' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, color: '#EF9F27' },
  { href: '/projects', label: 'Projects', icon: FolderOpen, color: '#D85A30' },
  { href: '/agents', label: 'Agents', icon: Bot, color: '#D4537E' },
  { href: '/digest', label: 'Daily Digest', icon: Newspaper, color: '#888780' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 shrink-0 h-screen bg-gray-950 border-r border-gray-800 flex flex-col py-5 px-3">
      <div className="px-3 mb-6">
        <span className="text-white font-semibold text-lg tracking-tight">Second<span className="text-violet-400">Brain</span></span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ href, label, icon: Icon, color }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-gray-800 text-white font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}>
              <Icon size={15} style={{ color: active ? color : undefined }} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 pt-3 mt-2 space-y-1">
        <Link href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${path === '/settings' ? 'bg-gray-800 text-white font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'}`}>
          <Settings size={15} /> Settings
        </Link>
        <Link href="/notes?capture=1"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <Zap size={14} /> Quick Capture
        </Link>
      </div>
    </aside>
  );
}
