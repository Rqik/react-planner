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
  groupId?: string;
  variant?: string;
  wallType?: 'interior' | 'exterior';
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
type ItemGesture = {
  mode: 'move' | 'draw' | 'place' | 'resize';
  side?: ResizeSide;
  pointerId: number;
  p: {
    x: number;
    y: number;
  };
  item: PlanItem;
  original: Project;
  ids?: string[];
};
export type SelectionBox = { x: number; y: number; w: number; h: number };
export type Gesture =
  | ItemGesture
  | {
      mode: 'marquee';
      pointerId: number;
      p: { x: number; y: number };
      original: Project;
      additive: boolean;
      initialSelection: string[];
    };
export type PlanPointerEvent = PointerEvent<SVGElement>;
