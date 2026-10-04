import { expect, it } from 'vitest';
import { room } from './project';
import {
  cloneSelection,
  expandGroups,
  reorderLayers,
  placeLayers,
} from './selection';
import { exteriorWalls } from './exterior-walls';
import { validProject } from './validation';

it('places dragged groups above or below a target layer', () => {
  const items = ['a', 'b', 'c', 'd'].map((id, n) => room(id, id, n, 0, 1, 1));
  expect(
    placeLayers(items, ['a', 'b'], 'd', true).map((item) => item.id),
  ).toEqual(['c', 'd', 'a', 'b']);
  expect(
    placeLayers(items, ['c', 'd'], 'a', false).map((item) => item.id),
  ).toEqual(['c', 'd', 'a', 'b']);
  expect(placeLayers(items, ['a', 'b'], 'a', true)).toBe(items);
});

it('selects whole groups and remaps group IDs when copying', () => {
  const a = { ...room('a', 'Room', 1, 1, 4, 4), groupId: 'original' };
  const b = {
    ...room('b', 'Bed', 2, 2, 1, 2),
    kind: 'bed' as const,
    groupId: 'original',
    variant: 'single',
  };
  const items = [a, b, room('c', 'Other', 10, 10, 2, 2)];
  expect(expandGroups(items, ['b'])).toEqual(['a', 'b']);
  const copied = cloneSelection([a, b]);
  expect(copied[0].groupId).toBe(copied[1].groupId);
  expect(copied[0].groupId).not.toBe('original');
  expect(new Set([...items, ...copied].map((item) => item.id)).size).toBe(5);
  expect(
    validProject({
      name: 'Test',
      floors: [JSON.parse(JSON.stringify(copied))],
    }),
  ).toBe(true);
});

it('moves selected layers without reversing their order', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((id, n) =>
    room(id, id, n, 0, 1, 1),
  );
  const ids = (list: typeof items) => list.map((item) => item.id).join('');
  expect(ids(reorderLayers(items, ['b', 'c'], 'forward'))).toBe('adbce');
  expect(ids(reorderLayers(items, ['b', 'c'], 'backward'))).toBe('bcade');
  expect(ids(reorderLayers(items, ['b', 'c'], 'front'))).toBe('adebc');
  expect(ids(reorderLayers(items, ['b', 'c'], 'back'))).toBe('bcade');
});

it('extracts exterior walls without copying shared room partitions', () => {
  const walls = exteriorWalls([
    room('a', 'A', 1, 1, 4, 3),
    room('b', 'B', 5, 1, 4, 3),
  ]);
  expect(walls).toHaveLength(4);
  expect(walls.some((wall) => wall.x === 4.95 && wall.h > 1)).toBe(false);
  expect(walls.every((wall) => wall.wallType === 'exterior')).toBe(true);
  expect(validProject({ name: 'Walls', floors: [walls] })).toBe(true);
});

it('preserves recessed exterior contours and separately marked exterior walls', () => {
  const rooms = [room('a', 'A', 1, 1, 3, 2), room('b', 'B', 1, 3, 2, 2)];
  expect(exteriorWalls(rooms)).toHaveLength(6);
  const custom = {
    ...room('wall', 'Wall', 10, 10, 0.2, 3),
    kind: 'wall' as const,
    wallType: 'exterior' as const,
  };
  const walls = exteriorWalls([...rooms, custom]);
  expect(walls).toHaveLength(7);
  expect(walls.at(-1)).toMatchObject({ x: 10, y: 10, w: 0.2, h: 3 });
});
