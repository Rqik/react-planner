import { expect, it } from 'vitest';
import { room } from './project';
import { alignCoordinate, resizeRoom } from './geometry';
import type { ResizeSide } from '../types';

it.each([
  ['left', -1.26, { x: 1.7, y: 3, w: 7.3, h: 5 }],
  ['right', 1.26, { x: 3, y: 3, w: 7.3, h: 5 }],
  ['top', -1.26, { x: 3, y: 1.7, w: 6, h: 6.3 }],
  ['bottom', 1.26, { x: 3, y: 3, w: 6, h: 6.3 }],
] as [ResizeSide, number, { x: number; y: number; w: number; h: number }][])(
  'resizes the %s edge while keeping the opposite edge fixed',
  (side, delta, expected) => {
    expect(
      resizeRoom(room('r', 'Room', 3, 3, 6, 5), side, delta, true),
    ).toMatchObject(expected);
  },
);

it('clamps edges to the plan and preserves a minimum room size', () => {
  const item = room('r', 'Room', 3, 3, 6, 5);
  expect(resizeRoom(item, 'left', -100, true)).toMatchObject({ x: 0, w: 9 });
  expect(resizeRoom(item, 'right', 100, true).w).toBe(21);
  expect(resizeRoom(item, 'top', -100, true)).toMatchObject({ y: 0, h: 8 });
  expect(resizeRoom(item, 'bottom', 100, true).h).toBe(17);
  expect(resizeRoom(item, 'left', 100, true)).toMatchObject({ x: 8.9, w: 0.1 });
  expect(resizeRoom(item, 'right', -100, true).w).toBe(0.1);
});

it('supports free sizing and keeps snapped objects on cells at the boundary', () => {
  const item = room('r', 'Room', 3, 3, 6, 5);
  expect(resizeRoom(item, 'right', 0.234, false).w).toBe(6.234);
  expect(alignCoordinate(20, 0, 19.88, true)).toBe(19.8);
  expect(alignCoordinate(2.234, 0, 24, false)).toBe(2.234);
});
