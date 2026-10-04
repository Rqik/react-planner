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
