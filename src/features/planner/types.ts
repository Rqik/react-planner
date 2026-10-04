import type { Project } from './model/project';
import type { PointerEvent } from 'react';
export type PlanItem = {
  id: string;
  kind: ItemKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  color: string;
};
export type ItemKind =
  | 'room'
  | 'wall'
  | 'door'
  | 'window'
  | 'bed'
  | 'sofa'
  | 'kitchen'
  | 'bath'
  | 'stairs';
export type Tool = 'select' | ItemKind;
export type ResizeSide = 'left' | 'right' | 'top' | 'bottom';
export type Gesture = {
  mode: 'move' | 'draw' | 'place' | 'resize';
  side?: ResizeSide;
  pointerId: number;
  p: {
    x: number;
    y: number;
  };
  item: PlanItem;
  original: Project;
};
export type PlanPointerEvent = PointerEvent<SVGElement>;
