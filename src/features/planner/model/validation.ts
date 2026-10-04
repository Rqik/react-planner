import type { Project } from './project';
import { furnitureVariants } from './furniture';
import type { ItemKind } from '../types';
const kinds = new Set([
  'room',
  'wall',
  'door',
  'window',
  'bed',
  'sofa',
  'kitchen',
  'bath',
  'stairs',
]);
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export function validProject(value: unknown): value is Project {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    !Array.isArray(value.floors) ||
    value.floors.length === 0 ||
    value.floors.length > 8
  )
    return false;
  return value.floors.every((floor) => {
    if (!Array.isArray(floor) || floor.length > 500) return false;
    const ids = new Set<string>();
    return floor.every((item) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        ids.has(item.id) ||
        typeof item.name !== 'string' ||
        typeof item.kind !== 'string' ||
        !kinds.has(item.kind) ||
        typeof item.color !== 'string' ||
        !/^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(item.color)
      )
        return false;
      const { x, y, w, h, rotation } = item;
      if (
        item.groupId !== undefined &&
        (typeof item.groupId !== 'string' || !item.groupId)
      )
        return false;
      if (
        item.wallType !== undefined &&
        (item.kind !== 'wall' ||
          !['interior', 'exterior'].includes(String(item.wallType)))
      )
        return false;
      if (
        item.variant !== undefined &&
        (typeof item.variant !== 'string' ||
          !furnitureVariants[item.kind as ItemKind]?.some(
            (variant) => variant.id === item.variant,
          ))
      )
        return false;
      if (
        typeof x !== 'number' ||
        typeof y !== 'number' ||
        typeof w !== 'number' ||
        typeof h !== 'number' ||
        typeof rotation !== 'number' ||
        ![x, y, w, h, rotation].every(Number.isFinite)
      )
        return false;
      ids.add(item.id);
      return (
        w >= 0.1 && h >= 0.1 && x >= 0 && y >= 0 && x + w <= 24 && y + h <= 20
      );
    });
  });
}
