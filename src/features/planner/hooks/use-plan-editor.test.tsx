// @vitest-environment jsdom
import { act, type ChangeEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePlanEditor, type PlanEditor } from './use-plan-editor';
import { createTemplate } from '../model/templates';
import type { PlanPointerEvent } from '../types';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let editor: PlanEditor;
let container: HTMLDivElement;

const pointer = (x: number, y: number) =>
  ({
    clientX: x,
    clientY: y,
    button: 0,
    pointerId: 1,
    stopPropagation: () => {},
    preventDefault: () => {},
  }) as PlanPointerEvent;

function mockCoordinates() {
  Object.assign(editor.svg.current!, {
    createSVGPoint: () => ({
      x: 0,
      y: 0,
      matrixTransform() {
        return { x: this.x, y: this.y };
      },
    }),
    getScreenCTM: () => ({ inverse: () => ({}) }),
    setPointerCapture: () => {},
  });
}

function Harness() {
  editor = usePlanEditor();
  return (
    <svg ref={editor.svg}>
      <g data-selection="true" />
      <rect width="2" height="3" />
    </svg>
  );
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

it('keeps the active floor valid across undo and redo', () => {
  act(() => editor.addFloor());
  expect(editor.floor).toBe(2);
  act(() => editor.undo());
  expect(editor.floor).toBe(1);
  expect(editor.items).toEqual(editor.project.floors[1]);
  act(() => editor.redo());
  expect(editor.floor).toBe(2);
  expect(editor.project.floors).toHaveLength(3);
});

it('undoes object changes and clears redo history after a new edit', () => {
  const id = editor.items[0].id;
  act(() => editor.setSelected(id));
  act(() => editor.patch({ name: 'Новая комната', w: 23 }));
  expect(editor.active?.w).toBe(21);
  expect(editor.active?.name).toBe('Новая комната');
  act(() => editor.undo());
  expect(editor.items[0].name).toBe('Кухня-гостиная');
  act(() => editor.setSelected(id));
  act(() => editor.duplicate());
  expect(editor.future).toHaveLength(0);
  expect(new Set(editor.items.map((item) => item.id)).size).toBe(
    editor.items.length,
  );
});

it('imports a valid project and preserves the current plan when import fails', async () => {
  const input = (contents: string) =>
    ({
      target: {
        files: [{ size: contents.length, text: async () => contents }],
        value: 'plan.json',
      },
    }) as unknown as ChangeEvent<HTMLInputElement>;
  const project = createTemplate('single');
  await act(async () => editor.importProject(input(JSON.stringify(project))));
  expect(editor.project).toEqual(project);
  expect(JSON.parse(localStorage.getItem('domplan-project')!)).toEqual(project);
  await act(async () => editor.importProject(input('{bad')));
  expect(editor.project).toEqual(project);
  expect(editor.status).toContain('Не удалось открыть файл');
});

it('exports SVG without selection markers', async () => {
  let exported: Blob | undefined;
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn((blob: Blob) => {
      exported = blob;
      return 'blob:test';
    }),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  act(() => editor.exportSvg());
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(exported!);
  });
  expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(text).toContain('<rect');
  expect(text).not.toContain('data-selection');
});

it('records a complete drawing gesture as a single undoable change', () => {
  const original = structuredClone(editor.project);
  Object.assign(editor.svg.current!, {
    createSVGPoint: () => ({
      x: 0,
      y: 0,
      matrixTransform() {
        return { x: this.x, y: this.y };
      },
    }),
    getScreenCTM: () => ({ inverse: () => ({}) }),
    setPointerCapture: () => {},
  });
  const pointer = (x: number, y: number) =>
    ({ clientX: x, clientY: y, button: 0, pointerId: 1 }) as PlanPointerEvent;
  act(() => editor.setTool('room'));
  act(() => {
    editor.down(pointer(1, 1));
    editor.move(pointer(4, 5));
    editor.up();
  });
  expect(editor.items.at(-1)).toMatchObject({
    kind: 'room',
    x: 1,
    y: 1,
    w: 3,
    h: 4,
  });
  expect(editor.past).toHaveLength(1);
  act(() => editor.undo());
  expect(editor.project).toEqual(original);
  act(() => editor.redo());
  expect(editor.items.at(-1)).toMatchObject({ w: 3, h: 4 });
});

it('resizes a room by its side with snapping, undo and redo', () => {
  mockCoordinates();
  act(() => editor.startResize(pointer(9, 5), editor.items[0].id, 'right'));
  act(() => {
    editor.move(pointer(10.26, 5));
    editor.up();
  });
  expect(editor.active).toMatchObject({ x: 3, y: 3, w: 7.3, h: 5 });
  expect(editor.past).toHaveLength(1);
  act(() => editor.undo());
  expect(editor.items[0].w).toBe(6);
  act(() => editor.redo());
  expect(editor.items[0].w).toBe(7.3);
});

it('cancels a resize without changing history and ignores a stationary click', () => {
  mockCoordinates();
  act(() => editor.startResize(pointer(3, 5), editor.items[0].id, 'left'));
  act(() => editor.move(pointer(1, 5)));
  expect(editor.items[0].x).toBe(1);
  act(() => editor.cancelGesture());
  expect(editor.items[0]).toMatchObject({ x: 3, w: 6 });
  expect(editor.past).toHaveLength(0);
  act(() => {
    editor.down(pointer(4, 4), editor.items[0].id);
    editor.up();
  });
  expect(editor.past).toHaveLength(0);
});

it('snaps movement to cells and supports disabling snapping', () => {
  mockCoordinates();
  act(() => {
    editor.down(pointer(4, 4), editor.items[0].id);
    editor.move(pointer(4.234, 4.456));
    editor.up();
  });
  expect(editor.items[0]).toMatchObject({ x: 3.2, y: 3.5 });
  act(() => editor.setSnapToGrid(false));
  act(() => {
    editor.down(pointer(4, 4), editor.items[0].id);
    editor.move(pointer(4.234, 4.456));
    editor.up();
  });
  expect(editor.items[0]).toMatchObject({ x: 3.434, y: 3.956 });
});
