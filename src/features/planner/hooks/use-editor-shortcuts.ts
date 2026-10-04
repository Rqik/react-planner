import { useEffect, useEffectEvent } from 'react';
import type { LayerCommand } from '../model/selection';

type Actions = {
  copy: () => void;
  paste: () => void;
  cut: () => void;
  undo: () => void;
  redo: () => void;
  remove: () => void;
  group: () => void;
  ungroup: () => void;
  selectAll: () => void;
  duplicate: () => void;
  escape: () => void;
  changeLayer: (command: LayerCommand) => void;
};

export function useEditorShortcuts(actions: Actions) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target;
    if (
      event.defaultPrevented ||
      event.isComposing ||
      (target instanceof Element &&
        target.closest(
          'input,textarea,select,[contenteditable="true"],[role="dialog"]',
        )) ||
      document.querySelector('[role="dialog"]')
    )
      return;
    const command = event.ctrlKey || event.metaKey;
    const key = event.code || `Key${event.key.toUpperCase()}`;
    let action: (() => void) | undefined;
    if (command && !event.altKey) {
      if (key === 'KeyC') action = actions.copy;
      if (key === 'KeyV') action = actions.paste;
      if (key === 'KeyX') action = actions.cut;
      if (key === 'KeyZ') action = event.shiftKey ? actions.redo : actions.undo;
      if (key === 'KeyY') action = actions.redo;
      if (key === 'KeyA') action = actions.selectAll;
      if (key === 'KeyD') action = actions.duplicate;
      if (key === 'KeyG')
        action = event.shiftKey ? actions.ungroup : actions.group;
      if (key === 'BracketRight')
        action = () =>
          actions.changeLayer(event.shiftKey ? 'front' : 'forward');
      if (key === 'BracketLeft')
        action = () =>
          actions.changeLayer(event.shiftKey ? 'back' : 'backward');
    } else if (event.key === 'Delete') action = actions.remove;
    else if (event.key === 'Escape') action = actions.escape;
    if (action) {
      event.preventDefault();
      action();
    }
  });
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
