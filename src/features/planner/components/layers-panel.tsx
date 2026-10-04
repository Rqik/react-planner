import { Layers, Group } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';

type Props = Pick<
  PlanEditor,
  'items' | 'selectedIds' | 'selectItem' | 'moveLayersTo'
>;
export function LayersPanel({
  items,
  selectedIds,
  selectItem,
  moveLayersTo,
}: Props) {
  return (
    <section className="layers-panel">
      <div className="panel-heading">
        <span>
          <Layers size={13} /> СЛОИ
        </span>
        <span>{items.length}</span>
      </div>
      <p className="layer-hint">
        Верхние строки — передний план. Перетяните строку для смены порядка.
        Shift + клик добавляет к выделению.
      </p>
      <div className="layer-list">
        {[...items].reverse().map((item) => (
          <button
            key={item.id}
            data-layer-id={item.id}
            draggable
            onDragStart={(event) => {
              if (!selectedIds.includes(item.id)) selectItem(item.id);
              event.dataTransfer.setData(
                'application/x-domplan-layer',
                item.id,
              );
              event.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              event.preventDefault();
              const source = event.dataTransfer.getData(
                'application/x-domplan-layer',
              );
              const box = event.currentTarget.getBoundingClientRect();
              if (source)
                moveLayersTo(
                  source,
                  item.id,
                  event.clientY < box.top + box.height / 2,
                );
            }}
            className={
              selectedIds.includes(item.id) ? 'layer-row selected' : 'layer-row'
            }
            onClick={(event) =>
              selectItem(
                item.id,
                event.shiftKey || event.ctrlKey || event.metaKey,
              )
            }
          >
            <span
              className="room-color"
              style={{
                background: item.kind === 'wall' ? '#35414e' : item.color,
              }}
            />
            <span>{item.name}</span>
            {item.groupId ? <Group size={13} aria-label="В группе" /> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
