import { Plus } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
type Props = Pick<PlanEditor, 'templates' | 'setTemplates' | 'loadTemplate'>;
export function TemplateDialog({
  templates,
  setTemplates,
  loadTemplate,
}: Props) {
  return (
    <Dialog open={templates} onOpenChange={setTemplates}>
      <DialogContent className="templates-dialog">
        <DialogTitle className="dialog-heading">С чего начнём?</DialogTitle>
        <DialogDescription>
          Откройте шаблон или создайте план с чистого листа. Текущий план можно
          вернуть кнопкой отмены.
        </DialogDescription>
        <div className="template-cards">
          {[
            {
              id: 'empty',
              name: 'Чистый лист',
              desc: 'Любые размеры и ваши идеи',
              rooms: [],
            },
            {
              id: 'single',
              name: 'Один этаж',
              desc: 'Семейный дом · 7 комнат',
              rooms: [
                [0, 0, 60, 50],
                [60, 0, 40, 40],
                [0, 50, 30, 50],
                [30, 50, 30, 50],
                [60, 40, 40, 20],
                [60, 60, 25, 40],
                [85, 60, 15, 40],
              ],
            },
            {
              id: 'family',
              name: 'Два этажа',
              desc: '4 спальни · кабинет · 2 этажа',
              rooms: [
                [0, 0, 60, 50],
                [60, 0, 40, 40],
                [60, 40, 25, 25],
                [85, 40, 15, 25],
                [0, 50, 30, 35],
                [30, 50, 30, 35],
                [60, 65, 20, 25],
                [80, 65, 20, 25],
              ],
            },
          ].map((t) => (
            <button
              className="template-card"
              key={t.id}
              onClick={() => loadTemplate(t.id)}
            >
              <div className="template-preview">
                {t.id === 'empty' ? (
                  <Plus size={40} />
                ) : (
                  <svg viewBox="-5 -5 110 110">
                    {t.rooms.map(([x, y, w, h], n) => (
                      <rect
                        key={n}
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={['#e8edf4', '#edf0e8', '#f3eee7'][n % 3]}
                        stroke="#455366"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                )}
              </div>
              <b>{t.name}</b>
              <span>{t.desc}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
