import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import type {
  PlanItem as Item,
  Tool,
  Gesture,
  PlanPointerEvent,
  ResizeSide,
} from '../types';
import { obj, type Project } from '../model/project';
import { tools, furniture } from '../model/tools';
import { alignCoordinate, resizeRoom } from '../model/geometry';
import { download } from '@/lib/download';
import { createTemplate } from '../model/templates';
import { readStoredProject, saveStoredProject } from '../model/storage';
import { validProject } from '../model/validation';
export function usePlanEditor() {
  const [project, setProjectState] = useState<Project>(readStoredProject),
    [floorIndex, setFloor] = useState(0),
    [tool, setTool] = useState<Tool>('select'),
    [selected, setSelected] = useState<string | null>(null),
    [zoom, setZoom] = useState(1),
    [grid, setGrid] = useState(true),
    [snapToGrid, setSnapToGrid] = useState(true),
    [templates, setTemplates] = useState(false),
    [status, setStatus] = useState(''),
    [past, setPast] = useState<Project[]>([]),
    [future, setFuture] = useState<Project[]>([]);
  const floor = Math.min(floorIndex, project.floors.length - 1);
  const svg = useRef<SVGSVGElement>(null),
    file = useRef<HTMLInputElement>(null),
    gesture = useRef<Gesture | null>(null),
    state = useRef(project);
  // Pointer events can arrive before React commits the preceding render.
  const setProject = useCallback((next: Project) => {
    state.current = next;
    setProjectState(next);
  }, []);
  const items = project.floors[floor] || [],
    active = items.find((i) => i.id === selected),
    total = items
      .filter((i) => i.kind === 'room')
      .reduce((s, i) => s + i.w * i.h, 0);
  const commit = (p: Project) => {
    const previous = state.current;
    setPast((h) => [...h.slice(-49), previous]);
    setFuture([]);
    setProject(p);
  };
  const replaceItems = (list: Item[]) => ({
    ...state.current,
    floors: state.current.floors.map((f, n) => (n === floor ? list : f)),
  });
  const patch = (values: Partial<Item>) => {
    if (!active) return;
    const next = { ...active, ...values };
    next.w = Math.max(0.1, Math.min(next.w, 24 - next.x));
    next.h = Math.max(0.1, Math.min(next.h, 20 - next.y));
    commit(replaceItems(items.map((i) => (i.id === selected ? next : i))));
  };
  useEffect(() => {
    if (!saveStoredProject(project))
      setStatus('Память браузера недоступна. Скачайте проект.');
  }, [project]);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(''), 3500);
    return () => clearTimeout(t);
  }, [status]);
  const undo = () => {
    if (!past.length) return;
    const current = state.current;
    setFuture((h) => [current, ...h]);
    setProject(past[past.length - 1]);
    setPast((h) => h.slice(0, -1));
    setSelected(null);
  };
  const redo = () => {
    if (!future.length) return;
    const current = state.current;
    setPast((h) => [...h, current]);
    setProject(future[0]);
    setFuture((h) => h.slice(1));
    setSelected(null);
  };
  const remove = () => {
    commit(replaceItems(items.filter((i) => i.id !== selected)));
    setSelected(null);
  };
  const point = (e: PlanPointerEvent) => {
    const p = svg.current!.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    return {
      x: Math.max(0, Math.min(24, q.x)),
      y: Math.max(0, Math.min(20, q.y)),
    };
  };
  const down = (e: PlanPointerEvent, id?: string) => {
    if (e.button !== 0) return;
    const raw = point(e);
    const p =
      tool === 'select'
        ? raw
        : {
            x: alignCoordinate(raw.x, 0, 24, snapToGrid),
            y: alignCoordinate(raw.y, 0, 20, snapToGrid),
          };
    svg.current!.setPointerCapture(e.pointerId);
    if (tool === 'select') {
      setSelected(id || null);
      if (id) {
        const i = items.find((i) => i.id === id)!;
        gesture.current = {
          mode: 'move',
          pointerId: e.pointerId,
          p,
          item: i,
          original: state.current,
        };
      }
      return;
    }
    const newid = crypto.randomUUID();
    const name =
      tool === 'room'
        ? 'Новая комната'
        : tools.find((t) => t.id === tool)?.label ||
          furniture.find((f) => f.id === tool)?.label ||
          'Объект';
    let w = 1,
      h = 1;
    const f = furniture.find((f) => f.id === tool);
    if (f) {
      w = f.w;
      h = f.h;
    }
    if (tool === 'window') {
      w = 1.5;
      h = 0.12;
    }
    if (tool === 'wall') {
      w = 0.2;
      h = 0.2;
    }
    if (tool === 'door') {
      w = 0.9;
      h = 0.9;
    }
    const i = {
      ...obj(
        tool,
        name,
        alignCoordinate(p.x, 0, 24 - w, snapToGrid),
        alignCoordinate(p.y, 0, 20 - h, snapToGrid),
        w,
        h,
      ),
      id: newid,
    };
    gesture.current = {
      mode: ['room', 'wall'].includes(tool) ? 'draw' : 'place',
      pointerId: e.pointerId,
      p,
      item: i,
      original: state.current,
    };
    setSelected(newid);
    setProject(replaceItems([...items, i]));
  };
  const startResize = (e: PlanPointerEvent, id: string, side: ResizeSide) => {
    if (e.button !== 0 || gesture.current) return;
    const item = state.current.floors[floor].find((item) => item.id === id);
    if (!item || item.kind !== 'room') return;
    e.stopPropagation();
    e.preventDefault();
    svg.current!.setPointerCapture(e.pointerId);
    setSelected(id);
    setTool('select');
    gesture.current = {
      mode: 'resize',
      side,
      pointerId: e.pointerId,
      p: point(e),
      item,
      original: state.current,
    };
  };
  const move = (e: PlanPointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const raw = point(e);
    const p =
      g.mode === 'draw'
        ? {
            x: alignCoordinate(raw.x, 0, 24, snapToGrid),
            y: alignCoordinate(raw.y, 0, 20, snapToGrid),
          }
        : raw;
    let i = g.item;
    if (g.mode === 'move')
      i = {
        ...i,
        x: alignCoordinate(i.x + p.x - g.p.x, 0, 24 - i.w, snapToGrid),
        y: alignCoordinate(i.y + p.y - g.p.y, 0, 20 - i.h, snapToGrid),
      };
    if (g.mode === 'resize' && g.side) {
      const delta =
        g.side === 'left' || g.side === 'right' ? p.x - g.p.x : p.y - g.p.y;
      i = resizeRoom(i, g.side, delta, snapToGrid);
    }
    if (g.mode === 'draw') {
      if (tool === 'wall') {
        const horizontal = Math.abs(p.x - g.p.x) >= Math.abs(p.y - g.p.y);
        i = {
          ...i,
          x: Math.min(g.p.x, p.x),
          y: Math.min(g.p.y, p.y),
          w: horizontal ? Math.max(0.2, Math.abs(p.x - g.p.x)) : 0.2,
          h: horizontal ? 0.2 : Math.max(0.2, Math.abs(p.y - g.p.y)),
        };
      } else
        i = {
          ...i,
          x: Math.min(p.x, g.p.x),
          y: Math.min(p.y, g.p.y),
          w: Math.max(0.2, Math.abs(p.x - g.p.x)),
          h: Math.max(0.2, Math.abs(p.y - g.p.y)),
        };
    }
    i = { ...i, x: Math.min(i.x, 24 - i.w), y: Math.min(i.y, 20 - i.h) };
    setProject(
      replaceItems(
        state.current.floors[floor].map((o) => (o.id === i.id ? i : o)),
      ),
    );
  };
  const up = (e?: PlanPointerEvent) => {
    if (!gesture.current) return;
    const g = gesture.current;
    if (e && e.pointerId !== g.pointerId) return;
    const current = state.current.floors[floor].find(
      (item) => item.id === g.item.id,
    );
    const original = g.original.floors[floor].find(
      (item) => item.id === g.item.id,
    );
    if (
      !original ||
      (current &&
        (current.x !== original.x ||
          current.y !== original.y ||
          current.w !== original.w ||
          current.h !== original.h))
    ) {
      setPast((h) => [...h.slice(-49), g.original]);
      setFuture([]);
    }
    gesture.current = null;
    if (g.mode === 'place' || g.mode === 'draw') setTool('select');
  };
  const cancelGesture = () => {
    if (!gesture.current) return;
    setProject(gesture.current.original);
    gesture.current = null;
    setSelected(null);
  };

  const exportSvg = () => {
    const copy = svg.current!.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('width', '1200');
    copy.setAttribute('height', '1000');
    copy.querySelectorAll('[data-selection]').forEach((n) => n.remove());
    download(
      new XMLSerializer().serializeToString(copy),
      `план-этаж-${floor + 1}.svg`,
      'image/svg+xml',
    );
    setStatus('Схема этажа скачана');
  };
  const loadTemplate = (kind: string) => {
    const p = createTemplate(kind);
    commit(p);
    setFloor(0);
    setSelected(null);
    setTemplates(false);
    setStatus('Проект открыт. Предыдущий план можно вернуть через отмену.');
  };
  const importProject = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 2000000) throw Error();
      const p = JSON.parse(await f.text());
      if (!validProject(p)) throw Error();
      commit(p);
      setFloor(0);
      setSelected(null);
      setStatus('Проект открыт');
    } catch {
      setStatus('Не удалось открыть файл. Нужен корректный проект ДомПлан.');
    }
    e.target.value = '';
  };
  const renameProject = (name: string) =>
    setProject({ ...state.current, name });
  const saveProject = () => {
    download(
      JSON.stringify(project, null, 2),
      'дом-проект.json',
      'application/json',
    );
    setStatus('Файл проекта скачан');
  };
  const addFloor = () => {
    if (project.floors.length >= 8) return;
    commit({ ...project, floors: [...project.floors, []] });
    setFloor(project.floors.length);
    setSelected(null);
  };
  const changeFloor = (value: string) => {
    setFloor(Number(value));
    setSelected(null);
  };
  const duplicate = () => {
    if (!active) return;
    const item = {
      ...active,
      id: crypto.randomUUID(),
      x: Math.min(24 - active.w, active.x + 0.3),
      y: Math.min(20 - active.h, active.y + 0.3),
    };
    commit(replaceItems([...items, item]));
    setSelected(item.id);
  };
  const rotate = () => {
    if (active) patch({ rotation: (active.rotation + 90) % 360 });
  };
  return {
    project,
    floor,
    tool,
    selected,
    zoom,
    grid,
    snapToGrid,
    templates,
    status,
    svg,
    file,
    items,
    active,
    total,
    past,
    future,
    setTool,
    setSelected,
    setZoom,
    setGrid,
    setSnapToGrid,
    setTemplates,
    patch,
    undo,
    redo,
    remove,
    down,
    move,
    up,
    startResize,
    cancelGesture,
    exportSvg,
    loadTemplate,
    importProject,
    renameProject,
    saveProject,
    addFloor,
    changeFloor,
    duplicate,
    rotate,
  };
}
export type PlanEditor = ReturnType<typeof usePlanEditor>;
