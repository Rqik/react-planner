import { Square, Upload, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { furnitureVariants } from '../model/furniture';
import type { PlanEditor } from '../hooks/use-plan-editor';
type Props = Pick<
  PlanEditor,
  | 'project'
  | 'selectedIds'
  | 'selectedItems'
  | 'file'
  | 'items'
  | 'active'
  | 'total'
  | 'setSelected'
  | 'selectItem'
  | 'patch'
  | 'importProject'
> & { selectionActions: ReactNode; layers: ReactNode };
export function PropertiesPanel({
  project,
  selectedIds,
  selectedItems,
  file,
  items,
  active,
  total,
  setSelected,
  patch,
  importProject,
  selectItem,
  selectionActions,
  layers,
}: Props) {
  return (
    <aside className="right-panel">
      <div className="panel-heading">
        {active ? 'СВОЙСТВА ОБЪЕКТА' : 'ОБЗОР ПРОЕКТА'}
      </div>
      {active ? (
        <>
          <div className="selection-title">
            <Square size={19} />
            <h2>{active.kind === 'room' ? 'Комната' : active.name}</h2>
            <button
              aria-label="Снять выделение"
              className="icon-btn"
              onClick={() => setSelected(null)}
            >
              <X size={16} />
            </button>
          </div>
          <label className="field">
            Название
            <input
              value={active.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </label>
          {furnitureVariants[active.kind] ? (
            <label className="field">
              Вариант
              <select
                value={active.variant ?? furnitureVariants[active.kind]![0].id}
                onChange={(event) => {
                  const variant = furnitureVariants[active.kind]!.find(
                    (item) => item.id === event.target.value,
                  )!;
                  patch({ variant: variant.id, w: variant.w, h: variant.h });
                }}
              >
                {furnitureVariants[active.kind]!.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {active.kind === 'wall' ? (
            <label className="wall-type">
              <Checkbox
                checked={active.wallType === 'exterior'}
                onCheckedChange={(checked) =>
                  patch({ wallType: checked ? 'exterior' : 'interior' })
                }
              />{' '}
              Внешняя стена
            </label>
          ) : null}
          <div className="field-grid">
            {(
              [
                { key: 'w', label: 'Ширина' },
                { key: 'h', label: 'Длина' },
                { key: 'x', label: 'X' },
                { key: 'y', label: 'Y' },
              ] as const
            ).map((f) => (
              <label className="field" key={f.key}>
                {f.label}
                <div className="unit-input">
                  <input
                    type="number"
                    min={f.key === 'x' || f.key === 'y' ? 0 : 0.1}
                    step=".1"
                    max={f.key === 'x' || f.key === 'w' ? 24 : 20}
                    value={active[f.key]}
                    onChange={(e) => {
                      if (e.target.value === '') return;
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v) || v < 0) return;
                      patch({
                        [f.key]: Math.min(
                          v,
                          f.key === 'x'
                            ? 24 - active.w
                            : f.key === 'y'
                              ? 20 - active.h
                              : 24,
                        ),
                      });
                    }}
                  />
                  <span>м</span>
                </div>
              </label>
            ))}
          </div>
          {active.kind === 'room' && (
            <>
              <div className="area-card">
                <span>Площадь комнаты</span>
                <strong>
                  {(active.w * active.h).toFixed(1)} <small>м²</small>
                </strong>
              </div>
              <label className="field">
                Цвет комнаты
                <div className="swatches">
                  {[
                    '#e9eef4',
                    '#edf0e8',
                    '#f3eee7',
                    '#e5f0f2',
                    '#eeedf3',
                    '#e8efeb',
                  ].map((c) => (
                    <button
                      key={c}
                      style={{ background: c }}
                      aria-label={`Цвет ${c}`}
                      className={active.color === c ? 'chosen' : ''}
                      onClick={() => patch({ color: c })}
                    />
                  ))}
                </div>
              </label>
            </>
          )}
        </>
      ) : selectedItems.length > 1 ? (
        <>
          <h2 className="overview-title">
            Выбрано {selectedItems.length} объектов
          </h2>
          <p className="muted">
            Потяните за выделенный объект, чтобы переместить всё выделение.
            Сгруппируйте объекты, чтобы сохранить связь.
          </p>
        </>
      ) : (
        <>
          <h2 className="overview-title">
            Ваш дом начинается
            <br />с хорошего плана.
          </h2>
          <p className="muted">
            Выберите комнату или объект на схеме, чтобы изменить его размеры.
          </p>
          <div className="area-card">
            <span>Комнаты на этаже</span>
            <strong>
              {total.toFixed(1)} <small>м²</small>
            </strong>
          </div>
          <div className="stat-row">
            <span>Комнат</span>
            <b>{items.filter((i) => i.kind === 'room').length}</b>
          </div>
          <div className="stat-row">
            <span>Этажей</span>
            <b>{project.floors.length}</b>
          </div>
        </>
      )}
      {selectionActions}
      {layers}
      <div className="room-section">
        <div className="panel-heading">
          КОМНАТЫ НА ЭТАЖЕ{' '}
          <span>{items.filter((i) => i.kind === 'room').length}</span>
        </div>
        {items
          .filter((i) => i.kind === 'room')
          .map((i) => (
            <button
              key={i.id}
              className={
                selectedIds.includes(i.id) ? 'room-row selected' : 'room-row'
              }
              onClick={(event) =>
                selectItem(
                  i.id,
                  event.shiftKey || event.ctrlKey || event.metaKey,
                )
              }
            >
              <span className="room-color" style={{ background: i.color }} />
              <span>{i.name}</span>
              <small>{(i.w * i.h).toFixed(1)}</small>
            </button>
          ))}
        {!items.some((i) => i.kind === 'room') && (
          <p className="muted">
            Выберите «Комната» и нарисуйте прямоугольник на сетке.
          </p>
        )}
      </div>
      <div className="right-bottom">
        <button className="quiet" onClick={() => file.current?.click()}>
          <Upload size={16} /> Открыть файл проекта
        </button>
        <input
          type="file"
          accept=".json"
          ref={file}
          hidden
          onChange={importProject}
        />
        <p>
          Эскиз для планирования.
          <br />
          Не заменяет строительный проект.
        </p>
      </div>
    </aside>
  );
}
