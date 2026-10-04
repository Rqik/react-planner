import { Layers } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
import { tools, furniture } from '../model/tools';
type Props = Pick<PlanEditor, 'tool' | 'setTool' | 'setTemplates'>;
export function ToolboxPanel({ tool, setTool, setTemplates }: Props) {
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
          <button
            key={f.id}
            className={tool === f.id ? 'furn active' : 'furn'}
            onClick={() => setTool(f.id)}
          >
            <f.icon size={25} />
            <span>{f.label}</span>
          </button>
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
      </div>
    </aside>
  );
}
