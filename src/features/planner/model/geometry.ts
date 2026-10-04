import type { PlanItem, ResizeSide } from '../types';

export const snap = (v: number) => Math.round(v * 10) / 10;

const precise = (value: number) => Number(value.toFixed(6));

export function alignCoordinate(
  value: number,
  min: number,
  max: number,
  enabled: boolean,
): number {
  if (!enabled) return precise(Math.max(min, Math.min(max, value)));
  const lower = Math.ceil(min * 10 - 1e-8) / 10;
  const upper = Math.floor(max * 10 + 1e-8) / 10;
  if (lower > upper) return precise(Math.max(min, Math.min(max, value)));
  return precise(Math.max(lower, Math.min(upper, snap(value))));
}

export function resizeRoom(
  item: PlanItem,
  side: ResizeSide,
  delta: number,
  snapping: boolean,
): PlanItem {
  const right = precise(item.x + item.w);
  const bottom = precise(item.y + item.h);
  if (side === 'left') {
    const x = alignCoordinate(item.x + delta, 0, right - 0.1, snapping);
    return { ...item, x, w: precise(right - x) };
  }
  if (side === 'right') {
    const edge = alignCoordinate(right + delta, item.x + 0.1, 24, snapping);
    return { ...item, w: precise(edge - item.x) };
  }
  if (side === 'top') {
    const y = alignCoordinate(item.y + delta, 0, bottom - 0.1, snapping);
    return { ...item, y, h: precise(bottom - y) };
  }
  const edge = alignCoordinate(bottom + delta, item.y + 0.1, 20, snapping);
  return { ...item, h: precise(edge - item.y) };
}
