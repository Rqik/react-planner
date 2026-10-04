import {
  Copy,
  ClipboardPaste,
  Scissors,
  Group,
  Ungroup,
  Trash2,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';

type Props = Pick<
  PlanEditor,
  | 'selectedItems'
  | 'active'
  | 'clipboardCount'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'duplicate'
  | 'group'
  | 'ungroup'
  | 'remove'
  | 'rotate'
  | 'selectRoomContents'
  | 'changeLayer'
>;
export function SelectionActions({
  selectedItems,
  active,
  clipboardCount,
  copy,
  paste,
  cut,
  duplicate,
  group,
  ungroup,
  remove,
  rotate,
  selectRoomContents,
  changeLayer,
}: Props) {
  const count = selectedItems.length;
  if (!count && !clipboardCount) return null;
  return (
    <div className="selection-actions">
      {active?.kind === 'room' ? (
        <button className="quiet contents-select" onClick={selectRoomContents}>
          Выделить комнату с содержимым
        </button>
      ) : null}
      <div className="object-actions">
        <button title="Копировать · Ctrl+C" disabled={!count} onClick={copy}>
          <Copy size={15} /> Копировать
        </button>
        <button
          title="Вставить · Ctrl+V"
          disabled={!clipboardCount}
          onClick={paste}
        >
          <ClipboardPaste size={15} /> Вставить
        </button>
        <button title="Вырезать · Ctrl+X" disabled={!count} onClick={cut}>
          <Scissors size={15} /> Вырезать
        </button>
        <button
          title="Дублировать · Ctrl+D"
          disabled={!count}
          onClick={duplicate}
        >
          <Copy size={15} /> Копия
        </button>
        <button
          title="Сгруппировать · Ctrl+G"
          disabled={count < 2}
          onClick={group}
        >
          <Group size={15} /> Группа
        </button>
        <button
          title="Разгруппировать · Ctrl+Shift+G"
          disabled={!selectedItems.some((item) => item.groupId)}
          onClick={ungroup}
        >
          <Ungroup size={15} /> Разгруппировать
        </button>
        {active && active.kind !== 'room' && active.kind !== 'wall' ? (
          <button onClick={rotate}>
            <RotateCw size={15} /> Повернуть
          </button>
        ) : null}
        <button
          title="Удалить · Delete"
          className="danger"
          disabled={!count}
          onClick={remove}
        >
          <Trash2 size={15} /> Удалить
        </button>
      </div>
      <div className="layer-actions" aria-label="Порядок слоёв">
        <button
          title="На передний план · Ctrl+Shift+]"
          aria-label="На передний план"
          disabled={!count}
          onClick={() => changeLayer('front')}
        >
          <ChevronsUp size={17} />
        </button>
        <button
          title="На слой выше · Ctrl+]"
          aria-label="На слой выше"
          disabled={!count}
          onClick={() => changeLayer('forward')}
        >
          <ArrowUp size={17} />
        </button>
        <button
          title="На слой ниже · Ctrl+["
          aria-label="На слой ниже"
          disabled={!count}
          onClick={() => changeLayer('backward')}
        >
          <ArrowDown size={17} />
        </button>
        <button
          title="На задний план · Ctrl+Shift+["
          aria-label="На задний план"
          disabled={!count}
          onClick={() => changeLayer('back')}
        >
          <ChevronsDown size={17} />
        </button>
      </div>
    </div>
  );
}
