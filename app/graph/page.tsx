'use client';
import { useEffect, useRef, useState } from 'react';
import { getNotes, getProjects } from '@/lib/store';

interface NodeData { id: string; label: string; type: string; color: string; x: number; y: number; z: number; connections: string[]; }

const TYPE_COLORS: Record<string, string> = {
  note: '#7F77DD', project: '#D85A30', topic: '#1D9E75', person: '#EF9F27',
};

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<NodeData | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const animRef = useRef<number>(0);
  const rotRef = useRef({ x: 0.3, y: 0 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const notes = getNotes();
    const projects = getProjects();
    const built: NodeData[] = [];

    notes.forEach((n, i) => {
      const angle = (i / notes.length) * Math.PI * 2;
      built.push({ id: n.id, label: n.title, type: 'note', color: TYPE_COLORS.note, x: Math.cos(angle) * 2, y: (Math.random() - 0.5) * 1.5, z: Math.sin(angle) * 2, connections: n.linkedIds });
    });

    projects.forEach((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2 + 0.5;
      built.push({ id: p.id, label: p.name, type: 'project', color: TYPE_COLORS.project, x: Math.cos(angle) * 3.5, y: (Math.random() - 0.5), z: Math.sin(angle) * 3.5, connections: p.noteIds });
    });

    const topics = ['productivity', 'ai', 'knowledge', 'habits', 'meta'];
    topics.forEach((t, i) => {
      const angle = (i / topics.length) * Math.PI * 2;
      built.push({ id: `topic_${t}`, label: t, type: 'topic', color: TYPE_COLORS.topic, x: Math.cos(angle) * 1.2, y: (Math.random() - 0.5) * 0.8, z: Math.sin(angle) * 1.2, connections: [] });
    });

    setNodes(built);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let w = canvas.offsetWidth, h = canvas.offsetHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    function project(x: number, y: number, z: number) {
      const rx = rotRef.current.x, ry = rotRef.current.y;
      const y2 = y * Math.cos(rx) - z * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z * Math.cos(rx);
      const x2 = x * Math.cos(ry) + z2 * Math.sin(ry);
      const z3 = -x * Math.sin(ry) + z2 * Math.cos(ry);
      const fov = 6;
      const scale = fov / (fov + z3);
      return { sx: w / 2 + x2 * scale * 80, sy: h / 2 + y2 * scale * 80, scale };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const projected = nodes.map(n => ({ ...n, ...project(n.x, n.y, n.z) }));
      projected.sort((a, b) => a.scale - b.scale);

      projected.forEach(n => {
        n.connections.forEach(cid => {
          const target = projected.find(p => p.id === cid);
          if (!target) return;
          ctx.beginPath();
          ctx.moveTo(n.sx, n.sy);
          ctx.lineTo(target.sx, target.sy);
          ctx.strokeStyle = `rgba(127,119,221,${0.15 * n.scale})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      });

      projected.forEach(n => {
        const r = Math.max(3, 7 * n.scale);
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.6 + 0.4 * n.scale;
        ctx.fill();
        ctx.globalAlpha = 1;
        if (n.scale > 0.85) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = `${Math.round(9 * n.scale)}px Inter,sans-serif`;
          ctx.fillText(n.label.slice(0, 22), n.sx + r + 3, n.sy + 4);
        }
      });

      rotRef.current.y += 0.002;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onDown = (e: MouseEvent) => { dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }; };
    const onUp = () => { dragRef.current.dragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      rotRef.current.y += (e.clientX - dragRef.current.lastX) * 0.005;
      rotRef.current.x += (e.clientY - dragRef.current.lastY) * 0.005;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [nodes]);

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Knowledge Graph</h1>
        <p className="text-gray-400 text-sm mt-1">Drag to rotate · Nodes auto-linked by AI</p>
      </div>
      <div className="flex gap-3 mb-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            {type}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ display: 'block' }} />
        <div className="absolute bottom-4 right-4 text-xs text-gray-600">{nodes.length} nodes</div>
      </div>
    </div>
  );
}
