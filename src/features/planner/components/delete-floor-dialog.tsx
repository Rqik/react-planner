import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { PlanEditor } from '../hooks/use-plan-editor';

type Props = Pick<
  PlanEditor,
  'pendingDeleteFloor' | 'setPendingDeleteFloor' | 'project' | 'deleteFloor'
>;
export function DeleteFloorDialog({
  pendingDeleteFloor,
  setPendingDeleteFloor,
  project,
  deleteFloor,
}: Props) {
  return (
    <Dialog
      open={pendingDeleteFloor !== null}
      onOpenChange={(open) => {
        if (!open) setPendingDeleteFloor(null);
      }}
    >
      <DialogContent>
        <DialogTitle>
          Удалить {pendingDeleteFloor === null ? '' : pendingDeleteFloor + 1}{' '}
          этаж?
        </DialogTitle>
        <DialogDescription>
          На этаже{' '}
          {pendingDeleteFloor === null
            ? 0
            : (project.floors[pendingDeleteFloor]?.length ?? 0)}{' '}
          объектов. Они будут удалены вместе с этажом. Действие можно отменить
          через Ctrl+Z.
        </DialogDescription>
        <div className="dialog-actions">
          <button className="quiet" onClick={() => setPendingDeleteFloor(null)}>
            Отмена
          </button>
          <button
            className="primary"
            onClick={() => {
              if (pendingDeleteFloor !== null) deleteFloor(pendingDeleteFloor);
            }}
          >
            Удалить этаж
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
