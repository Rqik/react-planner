import { Download, House, FilePlus2, Check } from 'lucide-react';
import type { PlanEditor } from '../hooks/use-plan-editor';
type Props = Pick<
  PlanEditor,
  'project' | 'setTemplates' | 'renameProject' | 'saveProject'
>;
export function ProjectHeader({
  project,
  setTemplates,
  renameProject,
  saveProject,
}: Props) {
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="ДомПлан">
        <span className="brand-icon">
          <House size={22} />
        </span>
        дом<span className="brand-light">план</span>
        <small>STUDIO</small>
      </a>
      <div className="project-title">
        <input
          aria-label="Название проекта"
          value={project.name}
          onChange={(e) => renameProject(e.target.value)}
        />
        <span>
          <Check size={13} /> В этом браузере
        </span>
      </div>
      <div className="header-actions">
        <button className="quiet" onClick={() => setTemplates(true)}>
          <FilePlus2 size={17} /> Новый проект
        </button>
        <button className="primary" onClick={saveProject}>
          <Download size={17} /> Сохранить проект
        </button>
      </div>
    </header>
  );
}
