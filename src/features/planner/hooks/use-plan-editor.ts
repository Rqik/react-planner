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
  SelectionBox,
  ItemKind,
} from '../types';
import { obj, type Project } from '../model/project';
import { tools, furniture } from '../model/tools';
import { alignCoordinate, resizeRoom } from '../model/geometry';
import { download } from '@/lib/download';
import { createTemplate } from '../model/templates';
import { readStoredProject, saveStoredProject } from '../model/storage';
import { validProject } from '../model/validation';
import {
  expandGroups,
  selectionBounds,
  cloneSelection,
  reorderLayers,
  placeLayers,
  type LayerCommand,
} from '../model/selection';
import { getFurnitureVariant } from '../model/furniture';
import { exteriorWalls } from '../model/exterior-walls';
import { useEditorShortcuts } from './use-editor-shortcuts';
export function usePlanEditor() {
  const [project, setProjectState] = useState<Project>(readStoredProject),
    [floorIndex, setFloor] = useState(0),
    [tool, setTool] = useState<Tool>('select'),
    [selectedIds, setSelectedIds] = useState<string[]>([]),
    [zoom, setZoom] = useState(1),
    [grid, setGrid] = useState(true),
    [snapToGrid, setSnapToGrid] = useState(true),
    [templates, setTemplates] = useState(false),
    [status, setStatus] = useState(''),
    [past, setPast] = useState<Project[]>([]),
    [future, setFuture] = useState<Project[]>([]),
    [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null),
    [variants, setVariants] = useState<Partial<Record<ItemKind, string>>>({}),
    [clipboardCount, setClipboardCount] = useState(0),
    [pendingDeleteFloor, setPendingDeleteFloor] = useState<number | null>(null),
    [showWallsBelow, setShowWallsBelow] = useState(false),
    [showRoomsBelow, setShowRoomsBelow] = useState(false);
  const floor = Math.min(floorIndex, project.floors.length - 1);
  const svg = useRef<SVGSVGElement>(null),
    file = useRef<HTMLInputElement>(null),
    gesture = useRef<Gesture | null>(null),
    state = useRef(project),
    selection = useRef<string[]>([]),
    clipboard = useRef<Item[]>([]),
    pasteCount = useRef(0);
  // Pointer events can arrive before React commits the preceding render.
  const setProject = useCallback((next: Project) => {
    state.current = next;
    setProjectState(next);
  }, []);
  const items = project.floors[floor] || [],
    selected = selectedIds[0] ?? null,
    selectedItems = items.filter((item) => selectedIds.includes(item.id)),
    active = selectedItems.length === 1 ? selectedItems[0] : undefined,
    total = items
      .filter((i) => i.kind === 'room')
      .reduce((s, i) => s + i.w * i.h, 0);
  const setSelection = (ids: string[]) => {
    selection.current = ids;
    setSelectedIds(ids);
  };
  const setSelected = (id: string | null) =>
    setSelection(id ? expandGroups(state.current.floors[floor], [id]) : []);
  const selectItem = (id: string, additive = false) => {
    const group = expandGroups(state.current.floors[floor], [id]);
    setSelection(
      additive
        ? group.every((value) => selection.current.includes(value))
          ? selection.current.filter((value) => !group.includes(value))
          : [...new Set([...selection.current, ...group])]
        : group,
    );
    setTool('select');
  };
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
    if (!selection.current.length) return;
    commit(
      replaceItems(
        state.current.floors[floor].filter(
          (i) => !selection.current.includes(i.id),
        ),
      ),
    );
    setSelected(null);
  };
  const copy = () => {
    const list = state.current.floors[floor].filter((item) =>
      selection.current.includes(item.id),
    );
    if (!list.length) return;
    clipboard.current = structuredClone(list);
    setClipboardCount(list.length);
    pasteCount.current = 0;
    setStatus(`Скопировано объектов: ${list.length}`);
  };
  const paste = () => {
    if (!clipboard.current.length) return;
    const current = state.current.floors[floor];
    if (current.length + clipboard.current.length > 500) {
      setStatus('На этаже может быть не больше 500 объектов');
      return;
    }
    pasteCount.current += 1;
    const clones = cloneSelection(
      clipboard.current,
      0.3 * pasteCount.current,
      0.3 * pasteCount.current,
    );
    commit(replaceItems([...current, ...clones]));
    setSelection(clones.map((item) => item.id));
    setTool('select');
  };
  const cut = () => {
    copy();
    remove();
  };
  const group = () => {
    if (selection.current.length < 2) return;
    const groupId = crypto.randomUUID();
    commit(
      replaceItems(
        state.current.floors[floor].map((item) =>
          selection.current.includes(item.id) ? { ...item, groupId } : item,
        ),
      ),
    );
  };
  const ungroup = () => {
    if (!selectedItems.some((item) => item.groupId)) return;
    commit(
      replaceItems(
        state.current.floors[floor].map((item) =>
          selection.current.includes(item.id)
            ? { ...item, groupId: undefined }
            : item,
        ),
      ),
    );
  };
  const selectAll = () =>
    setSelection(state.current.floors[floor].map((item) => item.id));
  const selectRoomContents = () => {
    if (!active || active.kind !== 'room') return;
    const ids = items
      .filter(
        (item) =>
          item.id === active.id ||
          (item.kind !== 'room' &&
            item.x >= active.x &&
            item.y >= active.y &&
            item.x + item.w <= active.x + active.w &&
            item.y + item.h <= active.y + active.h),
      )
      .map((item) => item.id);
    setSelection(expandGroups(items, ids));
  };
  const changeLayer = (command: LayerCommand) => {
    if (!selection.current.length) return;
    const current = state.current.floors[floor];
    const next = reorderLayers(current, selection.current, command);
    if (next.some((item, index) => item.id !== current[index].id))
      commit(replaceItems(next));
  };
  const moveLayersTo = (sourceId: string, targetId: string, above: boolean) => {
    const current = state.current.floors[floor];
    const ids = selection.current.includes(sourceId)
      ? selection.current
      : expandGroups(current, [sourceId]);
    const next = placeLayers(current, ids, targetId, above);
    if (next.some((item, index) => item.id !== current[index].id))
      commit(replaceItems(next));
    setSelection(ids);
  };
  const setFurnitureVariant = (kind: ItemKind, variant: string) => {
    setVariants((current) => ({ ...current, [kind]: variant }));
    setTool(kind);
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
      if (id) {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          selectItem(id, true);
          return;
        }
        if (!selection.current.includes(id)) setSelected(id);
        const i = items.find((i) => i.id === id)!;
        gesture.current = {
          mode: 'move',
          pointerId: e.pointerId,
          p,
          item: i,
          original: state.current,
          ids: [...selection.current],
        };
      } else {
        const additive = Boolean(e.shiftKey || e.ctrlKey || e.metaKey);
        const initialSelection = additive ? [...selection.current] : [];
        if (!additive) setSelected(null);
        gesture.current = {
          mode: 'marquee',
          pointerId: e.pointerId,
          p,
          original: state.current,
          additive,
          initialSelection,
        };
        setSelectionBox({ x: p.x, y: p.y, w: 0, h: 0 });
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
    const f =
      getFurnitureVariant(tool, variants[tool]) ??
      furniture.find((f) => f.id === tool);
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
      ...(getFurnitureVariant(tool, variants[tool])
        ? { variant: getFurnitureVariant(tool, variants[tool])!.id }
        : {}),
    };
    gesture.current = {
      mode: ['room', 'wall'].includes(tool) ? 'draw' : 'place',
      pointerId: e.pointerId,
      p,
      item: i,
      original: state.current,
    };
    setSelection([newid]);
    if (items.length >= 500) {
      gesture.current = null;
      setStatus('На этаже может быть не больше 500 объектов');
      return;
    }
    const insertion =
      tool === 'room' ? items.findIndex((item) => item.kind !== 'room') : -1;
    const next = [...items];
    next.splice(insertion < 0 ? next.length : insertion, 0, i);
    setProject(replaceItems(next));
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
    if (g.mode === 'marquee') {
      const box = {
        x: Math.min(g.p.x, raw.x),
        y: Math.min(g.p.y, raw.y),
        w: Math.abs(raw.x - g.p.x),
        h: Math.abs(raw.y - g.p.y),
      };
      setSelectionBox(box);
      if (box.w > 0.03 || box.h > 0.03) {
        const ids = items
          .filter(
            (item) =>
              item.x >= box.x &&
              item.y >= box.y &&
              item.x + item.w <= box.x + box.w &&
              item.y + item.h <= box.y + box.h,
          )
          .map((item) => item.id);
        setSelection([
          ...new Set([...g.initialSelection, ...expandGroups(items, ids)]),
        ]);
      }
      return;
    }
    const p =
      g.mode === 'draw'
        ? {
            x: alignCoordinate(raw.x, 0, 24, snapToGrid),
            y: alignCoordinate(raw.y, 0, 20, snapToGrid),
          }
        : raw;
    let i = g.item;
    if (g.mode === 'move') {
      const moving = g.original.floors[floor].filter((item) =>
        (g.ids ?? [g.item.id]).includes(item.id),
      );
      const bounds = selectionBounds(moving);
      const anchorX = alignCoordinate(
        i.x + p.x - g.p.x,
        i.x - bounds.x,
        i.x + 24 - bounds.x - bounds.w,
        snapToGrid,
      );
      const anchorY = alignCoordinate(
        i.y + p.y - g.p.y,
        i.y - bounds.y,
        i.y + 20 - bounds.y - bounds.h,
        snapToGrid,
      );
      const dx = anchorX - i.x,
        dy = anchorY - i.y;
      setProject(
        replaceItems(
          g.original.floors[floor].map((item) =>
            moving.some((value) => value.id === item.id)
              ? {
                  ...item,
                  x: Number((item.x + dx).toFixed(6)),
                  y: Number((item.y + dy).toFixed(6)),
                }
              : item,
          ),
        ),
      );
      return;
    }
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
    if (g.mode === 'marquee') {
      gesture.current = null;
      setSelectionBox(null);
      return;
    }
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
    setSelectionBox(null);
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
    setPendingDeleteFloor(null);
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
  const deleteFloor = (index = floor) => {
    const current = state.current;
    if (current.floors.length <= 1 || !current.floors[index]) return;
    commit({
      ...current,
      floors: current.floors.filter((_, n) => n !== index),
    });
    setFloor(Math.max(0, Math.min(index, current.floors.length - 2)));
    setSelected(null);
    setPendingDeleteFloor(null);
  };
  const requestDeleteFloor = () => {
    if (project.floors.length <= 1) return;
    if (items.length) setPendingDeleteFloor(floor);
    else deleteFloor();
  };
  const copyExteriorWalls = () => {
    if (floor === 0) return;
    const walls = exteriorWalls(state.current.floors[floor - 1]);
    const current = state.current.floors[floor];
    const key = (item: Item) =>
      [item.kind, item.x, item.y, item.w, item.h, item.rotation].join(':');
    const existing = new Set(current.map(key));
    const unique = walls.filter((item) => {
      const signature = key(item);
      if (existing.has(signature)) return false;
      existing.add(signature);
      return true;
    });
    if (current.length + unique.length > 500) {
      setStatus('На этаже может быть не больше 500 объектов');
      return;
    }
    if (!unique.length) {
      setStatus('Новых внешних стен для переноса нет');
      return;
    }
    const firstObject = current.findIndex(
      (item) => item.kind !== 'room' && item.kind !== 'wall',
    );
    const next = [...current];
    next.splice(firstObject < 0 ? next.length : firstObject, 0, ...unique);
    commit(replaceItems(next));
    setSelection(unique.map((item) => item.id));
    setStatus(`Перенесено внешних стен: ${unique.length}`);
  };
  const changeFloor = (value: string) => {
    setFloor(Number(value));
    setSelected(null);
  };
  const duplicate = () => {
    if (!selectedItems.length) return;
    if (items.length + selectedItems.length > 500) {
      setStatus('На этаже может быть не больше 500 объектов');
      return;
    }
    const clones = cloneSelection(selectedItems);
    commit(replaceItems([...items, ...clones]));
    setSelection(clones.map((item) => item.id));
  };
  const rotate = () => {
    if (active) patch({ rotation: (active.rotation + 90) % 360 });
  };
  useEditorShortcuts({
    copy,
    paste,
    cut,
    undo,
    redo,
    remove,
    group,
    ungroup,
    selectAll,
    duplicate,
    changeLayer,
    escape: () => {
      cancelGesture();
      setSelected(null);
    },
  });
  return {
    project,
    floor,
    tool,
    selected,
    selectedIds,
    selectedItems,
    selectionBox,
    variants,
    clipboardCount,
    pendingDeleteFloor,
    showWallsBelow,
    showRoomsBelow,
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
    selectItem,
    setFurnitureVariant,
    setPendingDeleteFloor,
    setShowWallsBelow,
    setShowRoomsBelow,
    setZoom,
    setGrid,
    setSnapToGrid,
    setTemplates,
    patch,
    undo,
    redo,
    remove,
    copy,
    paste,
    cut,
    group,
    ungroup,
    selectAll,
    selectRoomContents,
    changeLayer,
    moveLayersTo,
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
    requestDeleteFloor,
    deleteFloor,
    copyExteriorWalls,
    changeFloor,
    duplicate,
    rotate,
  };
}
export type PlanEditor = ReturnType<typeof usePlanEditor>;
