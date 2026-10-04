import { Layers } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
import { tools, furniture } from '../model/tools';
import { furnitureVariants } from '../model/furniture';
type Props = Pick<
  PlanEditor,
  'tool' | 'setTool' | 'setTemplates' | 'variants' | 'setFurnitureVariant'
>;
export function ToolboxPanel({
  tool,
  setTool,
  setTemplates,
  variants,
  setFurnitureVariant,
}: Props) {
  return (
    <aside className="left-panel">
      <div className="panel-heading">СОЗДАТЬ ПЛАН</div>
      <div className="tool-list">
        {tools.map((t) => (
          <button
            key={t.id}
            className={tool === t.id ? 'tool active' : 'tool'}
            onClick={() => setTool(t.id)}
          >
            <t.icon size={19} />
            <span>{t.label}</span>
            {tool === t.id && <span className="tool-dot" />}
          </button>
        ))}
      </div>
      <div className="panel-heading section-gap">МЕБЕЛЬ И ОБЪЕКТЫ</div>
      <div className="furniture">
        {furniture.map((f) => (
          <div key={f.id} className="furniture-option">
            <button
              className={tool === f.id ? 'furn active' : 'furn'}
              onClick={() => setTool(f.id)}
            >
              <f.icon size={25} />
              <span>{f.label}</span>
            </button>
            <select
              aria-label={`Вариант: ${f.label}`}
              value={variants[f.id] ?? furnitureVariants[f.id]?.[0].id}
              onChange={(event) =>
                setFurnitureVariant(f.id, event.target.value)
              }
            >
              {furnitureVariants[f.id]?.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="left-bottom">
        <button className="template-btn" onClick={() => setTemplates(true)}>
          <Layers size={19} />
          <div>
            Готовые планировки<small>Начните с шаблона</small>
          </div>
        </button>
        <p>Комнату и стену рисуйте протягиванием. Объекты ставьте нажатием.</p>
        <p>
          Shift + клик — несколько объектов. Выделение рамкой — потяните на
          пустом месте. Ctrl+G — группа.
        </p>
      </div>
    </aside>
  );
}
