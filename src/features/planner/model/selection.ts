import type { PlanItem, SelectionBox } from '../types';

export function expandGroups(items: PlanItem[], ids: string[]): string[] {
  const groups = new Set(
    items
      .filter((item) => ids.includes(item.id) && item.groupId)
      .map((item) => item.groupId),
  );
  return items
    .filter(
      (item) =>
        ids.includes(item.id) || (item.groupId && groups.has(item.groupId)),
    )
    .map((item) => item.id);
}

export function selectionBounds(items: PlanItem[]): SelectionBox {
  const x = Math.min(...items.map((item) => item.x));
  const y = Math.min(...items.map((item) => item.y));
  return {
    x,
    y,
    w: Math.max(...items.map((item) => item.x + item.w)) - x,
    h: Math.max(...items.map((item) => item.y + item.h)) - y,
  };
}

export function cloneSelection(
  items: PlanItem[],
  dx = 0.3,
  dy = 0.3,
): PlanItem[] {
  if (!items.length) return [];
  const bounds = selectionBounds(items);
  dx = Math.max(-bounds.x, Math.min(24 - bounds.x - bounds.w, dx));
  dy = Math.max(-bounds.y, Math.min(20 - bounds.y - bounds.h, dy));
  const groups = new Map<string, string>();
  return items.map((item) => {
    if (item.groupId && !groups.has(item.groupId))
      groups.set(item.groupId, crypto.randomUUID());
    return {
      ...item,
      id: crypto.randomUUID(),
      x: Number((item.x + dx).toFixed(6)),
      y: Number((item.y + dy).toFixed(6)),
      groupId: item.groupId ? groups.get(item.groupId) : undefined,
    };
  });
}

export type LayerCommand = 'forward' | 'backward' | 'front' | 'back';
export function placeLayers(
  items: PlanItem[],
  ids: string[],
  targetId: string,
  above: boolean,
): PlanItem[] {
  if (ids.includes(targetId)) return items;
  const chosen = items.filter((item) => ids.includes(item.id));
  const remaining = items.filter((item) => !ids.includes(item.id));
  const index = remaining.findIndex((item) => item.id === targetId);
  if (!chosen.length || index < 0) return items;
  remaining.splice(index + (above ? 1 : 0), 0, ...chosen);
  return remaining;
}
export function reorderLayers(
  items: PlanItem[],
  ids: string[],
  command: LayerCommand,
): PlanItem[] {
  const selected = new Set(ids);
  if (command === 'front')
    return [
      ...items.filter((item) => !selected.has(item.id)),
      ...items.filter((item) => selected.has(item.id)),
    ];
  if (command === 'back')
    return [
      ...items.filter((item) => selected.has(item.id)),
      ...items.filter((item) => !selected.has(item.id)),
    ];
  const result = [...items];
  if (command === 'forward') {
    for (let n = result.length - 2; n >= 0; n--)
      if (selected.has(result[n].id) && !selected.has(result[n + 1].id))
        [result[n], result[n + 1]] = [result[n + 1], result[n]];
  } else {
    for (let n = 1; n < result.length; n++)
      if (selected.has(result[n].id) && !selected.has(result[n - 1].id))
        [result[n], result[n - 1]] = [result[n - 1], result[n]];
  }
  return result;
}
