import {
  Plus,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
  Copy,
} from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { PlanObject } from './plan-object';
import { PlanGrid, useGridPatternId } from './plan-grid';
import { RoomResizeHandles } from './room-resize-handles';
import { snap } from '../model/geometry';
import { FloorUnderlay } from './floor-underlay';
import { ShortcutHelp } from './shortcut-help';
type Props = Pick<
  PlanEditor,
  | 'project'
  | 'floor'
  | 'tool'
  | 'selected'
  | 'selectedIds'
  | 'selectionBox'
  | 'showWallsBelow'
  | 'showRoomsBelow'
  | 'setShowWallsBelow'
  | 'setShowRoomsBelow'
  | 'copyExteriorWalls'
  | 'requestDeleteFloor'
  | 'zoom'
  | 'grid'
  | 'snapToGrid'
  | 'svg'
  | 'items'
  | 'past'
  | 'future'
  | 'setZoom'
  | 'setGrid'
  | 'setSnapToGrid'
  | 'undo'
  | 'redo'
  | 'down'
  | 'move'
  | 'up'
  | 'startResize'
  | 'cancelGesture'
  | 'exportSvg'
  | 'addFloor'
  | 'changeFloor'
>;
export function PlanCanvas({
  project,
  floor,
  tool,
  selected,
  selectedIds,
  selectionBox,
  showWallsBelow,
  showRoomsBelow,
  setShowWallsBelow,
  setShowRoomsBelow,
  copyExteriorWalls,
  requestDeleteFloor,
  zoom,
  grid,
  snapToGrid,
  svg,
  items,
  past,
  future,
  setZoom,
  setGrid,
  setSnapToGrid,
  undo,
  redo,
  down,
  move,
  up,
  startResize,
  cancelGesture,
  exportSvg,
  addFloor,
  changeFloor,
}: Props) {
  const patternId = useGridPatternId();
  const selectedRoom = items.find(
    (item) =>
      selectedIds.length === 1 && item.id === selected && item.kind === 'room',
  );
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
        <button
          title={
            project.floors.length <= 1
              ? 'Последний этаж нельзя удалить'
              : 'Удалить этаж'
          }
          aria-label="Удалить текущий этаж"
          className="icon-btn"
          disabled={project.floors.length <= 1}
          onClick={requestDeleteFloor}
        >
          <Trash2 size={17} />
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
      <div className="floor-tools">
        <label>
          <Checkbox
            id="walls-below"
            checked={showWallsBelow}
            disabled={floor === 0}
            onCheckedChange={(checked) => setShowWallsBelow(checked === true)}
          />{' '}
          Стены снизу
        </label>
        <label>
          <Checkbox
            id="rooms-below"
            checked={showRoomsBelow}
            disabled={floor === 0}
            onCheckedChange={(checked) => setShowRoomsBelow(checked === true)}
          />{' '}
          Комнаты снизу
        </label>
        <button
          className="quiet"
          disabled={floor === 0}
          onClick={copyExteriorWalls}
        >
          <Copy size={14} /> Перенести внешние стены
        </button>
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
            viewBox="-1 -1 26 22"
            className="plan"
            role="img"
            aria-label={`Редактор плана, этаж ${floor + 1}`}
            onPointerDown={(e) => down(e)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancelGesture}
            onLostPointerCapture={cancelGesture}
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
          >
            <PlanGrid id={patternId} visible={grid} />
            {items.map((i) => (
              <PlanObject
                key={i.id}
                item={i}
                selected={selectedIds.includes(i.id)}
                gridFill={grid ? `url(#${patternId})` : undefined}
                onPointerDown={down}
              />
            ))}
            {floor > 0 && (showWallsBelow || showRoomsBelow) ? (
              <FloorUnderlay
                items={project.floors[floor - 1]}
                walls={showWallsBelow}
                rooms={showRoomsBelow}
              />
            ) : null}
            {selectionBox ? (
              <rect
                data-selection="true"
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.w}
                height={selectionBox.h}
                fill="#db6545"
                fillOpacity=".08"
                stroke="#db6545"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                strokeDasharray=".1 .06"
                pointerEvents="none"
              />
            ) : null}
            {selectedRoom ? (
              <RoomResizeHandles item={selectedRoom} onResize={startResize} />
            ) : null}
          </svg>
        </div>
      </div>
      <div className="canvas-footer">
        <span className="snap-control">
          <Checkbox
            id="snap-grid"
            checked={snapToGrid}
            onCheckedChange={(value) => setSnapToGrid(value === true)}
          />
          <label htmlFor="snap-grid">Привязка 10 см</label>
          <span className="footer-muted">· Поле 24 × 20 м</span>
        </span>
        <div className="footer-actions">
          <ShortcutHelp />
          <div className="zoom">
            <button
              aria-label="Уменьшить"
              onClick={() => setZoom((z) => Math.max(0.6, snap(z - 0.2)))}
            >
              <ZoomOut size={17} />
            </button>
            <button onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </button>
            <button
              aria-label="Увеличить"
              onClick={() => setZoom((z) => Math.min(2.4, snap(z + 0.2)))}
            >
              <ZoomIn size={17} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
