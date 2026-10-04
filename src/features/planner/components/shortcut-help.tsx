const shortcuts = [
  ['Ctrl+C / Ctrl+V', 'Копировать / вставить'],
  ['Ctrl+X / Delete', 'Вырезать / удалить'],
  ['Ctrl+Z / Ctrl+Shift+Z', 'Отмена / повтор'],
  ['Ctrl+A / Ctrl+D', 'Выделить всё / копия'],
  ['Ctrl+G / Ctrl+Shift+G', 'Группа / разгруппировать'],
  ['Ctrl+] / Ctrl+[', 'На слой выше / ниже'],
  ['Ctrl+Shift+] / Ctrl+Shift+[', 'Передний / задний план'],
  ['Shift + клик', 'Добавить объект к выделению'],
  ['Escape', 'Снять выделение'],
];
export function ShortcutHelp() {
  return (
    <details className="shortcut-help">
      <summary>Клавиши</summary>
      <div className="shortcut-popover">
        {shortcuts.map(([keys, description]) => (
          <div key={keys}>
            <kbd>{keys}</kbd>
            <span>{description}</span>
          </div>
        ))}
        <p>На Mac используйте ⌘ вместо Ctrl.</p>
      </div>
    </details>
  );
}
