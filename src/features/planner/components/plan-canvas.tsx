import { Plus, Undo2, Redo2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { PlanObject } from './plan-object';
import { snap } from '../model/geometry';
type Props = Pick<
  PlanEditor,
  | 'project'
  | 'floor'
  | 'tool'
  | 'selected'
  | 'zoom'
  | 'grid'
  | 'svg'
  | 'items'
  | 'past'
  | 'future'
  | 'setZoom'
  | 'setGrid'
  | 'undo'
  | 'redo'
  | 'down'
  | 'move'
  | 'up'
  | 'exportSvg'
  | 'addFloor'
  | 'changeFloor'
>;
export function PlanCanvas({
  project,
  floor,
  tool,
  selected,
  zoom,
  grid,
  svg,
  items,
  past,
  future,
  setZoom,
  setGrid,
  undo,
  redo,
  down,
  move,
  up,
  exportSvg,
  addFloor,
  changeFloor,
}: Props) {
  return (
    <main className="editor">
      <div className="canvas-toolbar">
        <Tabs value={String(floor)} onValueChange={changeFloor}>
          <TabsList className="floor-tabs">
            {project.floors.map((_, n) => (
              <TabsTrigger key={n} value={String(n)}>
                {n + 1} этаж
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          title="Добавить этаж"
          aria-label="Добавить этаж"
          className="icon-btn"
          disabled={project.floors.length >= 8}
          onClick={addFloor}
        >
          <Plus size={18} />
        </button>
        <span className="toolbar-separator" />
        <button
          className="icon-btn"
          title="Отменить"
          aria-label="Отменить"
          disabled={!past.length}
          onClick={undo}
        >
          <Undo2 size={18} />
        </button>
        <button
          className="icon-btn"
          title="Повторить"
          aria-label="Повторить"
          disabled={!future.length}
          onClick={redo}
        >
          <Redo2 size={18} />
        </button>
        <div className="toolbar-end">
          <Checkbox
            id="grid"
            checked={grid}
            onCheckedChange={(v) => setGrid(v === true)}
          />
          <label htmlFor="grid">Сетка</label>
          <button className="quiet export" onClick={exportSvg}>
            <Download size={16} /> SVG
          </button>
        </div>
      </div>
      <div className="canvas-scroll">
        <div
          className="drawing-sheet"
          style={{ width: `${100 * zoom}%`, minWidth: 650 * zoom }}
        >
          <div className="sheet-caption">
            <span>ПЛАН {floor + 1} ЭТАЖА</span>
            <span>Размеры в метрах</span>
          </div>
          <svg
            ref={svg}
            viewBox="0 0 24 20"
            className="plan"
            role="img"
            aria-label={`Редактор плана, этаж ${floor + 1}`}
            onPointerDown={(e) => down(e)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
          >
            <defs>
              <pattern
                id="smallgrid"
                width=".1"
                height=".1"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M .1 0 L 0 0 0 .1"
                  fill="none"
                  stroke="#e3e8ee"
                  strokeWidth=".008"
                />
              </pattern>
              <pattern
                id="grid"
                width="1"
                height="1"
                patternUnits="userSpaceOnUse"
              >
                <rect width="1" height="1" fill="url(#smallgrid)" />
                <path
                  d="M 1 0 L 0 0 0 1"
                  fill="none"
                  stroke="#cad3df"
                  strokeWidth=".012"
                />
              </pattern>
            </defs>
            <rect width="24" height="20" fill="#ffffff" />
            {grid && <rect width="24" height="20" fill="url(#grid)" />}
            {Array.from({ length: 23 }, (_, n) => (
              <text
                key={n}
                x={n + 1}
                y=".55"
                fontSize=".2"
                fill="#97a5b4"
                textAnchor="middle"
                className="ruler"
              >
                {n + 1}
              </text>
            ))}
            {Array.from({ length: 19 }, (_, n) => (
              <text
                key={n}
                x=".35"
                y={n + 1}
                fontSize=".2"
                fill="#97a5b4"
                textAnchor="middle"
                className="ruler"
              >
                {n + 1}
              </text>
            ))}
            {[
              ...items.filter((i) => i.kind === 'room'),
              ...items.filter((i) => i.kind !== 'room'),
            ].map((i) => (
              <PlanObject
                key={i.id}
                item={i}
                selected={selected === i.id}
                onPointerDown={down}
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="canvas-footer">
        <span>
          <span className="crosshair">⊹</span> Привязка 10 см{' '}
          <span className="footer-muted">· Поле 24 × 20 м</span>
        </span>
        <div className="zoom">
          <button
            aria-label="Уменьшить"
            onClick={() => setZoom((z) => Math.max(0.6, snap(z - 0.2)))}
          >
            <ZoomOut size={17} />
          </button>
          <button onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
          <button
            aria-label="Увеличить"
            onClick={() => setZoom((z) => Math.min(2.4, snap(z + 0.2)))}
          >
            <ZoomIn size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
