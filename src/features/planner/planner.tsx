import { Check } from 'lucide-react';
import { usePlanEditor } from './hooks/use-plan-editor';
import { ProjectHeader } from './components/project-header';
import { ToolboxPanel } from './components/toolbox-panel';
import { PlanCanvas } from './components/plan-canvas';
import { PropertiesPanel } from './components/properties-panel';
import { TemplateDialog } from './components/template-dialog';
export function Planner() {
  const editor = usePlanEditor();
  return (
    <div className="app">
      <ProjectHeader
        project={editor.project}
        setTemplates={editor.setTemplates}
        renameProject={editor.renameProject}
        saveProject={editor.saveProject}
      />
      <div className="workspace">
        <ToolboxPanel
          tool={editor.tool}
          setTool={editor.setTool}
          setTemplates={editor.setTemplates}
        />
        <PlanCanvas
          project={editor.project}
          floor={editor.floor}
          tool={editor.tool}
          selected={editor.selected}
          zoom={editor.zoom}
          grid={editor.grid}
          snapToGrid={editor.snapToGrid}
          svg={editor.svg}
          items={editor.items}
          past={editor.past}
          future={editor.future}
          setZoom={editor.setZoom}
          setGrid={editor.setGrid}
          setSnapToGrid={editor.setSnapToGrid}
          undo={editor.undo}
          redo={editor.redo}
          down={editor.down}
          move={editor.move}
          up={editor.up}
          startResize={editor.startResize}
          cancelGesture={editor.cancelGesture}
          exportSvg={editor.exportSvg}
          addFloor={editor.addFloor}
          changeFloor={editor.changeFloor}
        />
        <PropertiesPanel
          project={editor.project}
          selected={editor.selected}
          file={editor.file}
          items={editor.items}
          active={editor.active}
          total={editor.total}
          setTool={editor.setTool}
          setSelected={editor.setSelected}
          patch={editor.patch}
          remove={editor.remove}
          importProject={editor.importProject}
          duplicate={editor.duplicate}
          rotate={editor.rotate}
        />
      </div>
      {editor.status ? (
        <div className="toast" role="status">
          <Check size={17} />
          {editor.status}
        </div>
      ) : null}
      <TemplateDialog
        templates={editor.templates}
        setTemplates={editor.setTemplates}
        loadTemplate={editor.loadTemplate}
      />
    </div>
  );
}
