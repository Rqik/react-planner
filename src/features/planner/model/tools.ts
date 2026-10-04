import {
  MousePointer2,
  Square,
  Minus,
  DoorOpen,
  PanelsTopLeft,
  BedDouble,
  Sofa,
  CookingPot,
  Bath,
  MoveUpRight,
} from 'lucide-react';
export const tools = [
  { id: 'select', label: 'Выбрать', icon: MousePointer2 },
  { id: 'room', label: 'Комната', icon: Square },
  { id: 'wall', label: 'Стена', icon: Minus },
  { id: 'door', label: 'Дверь', icon: DoorOpen },
  { id: 'window', label: 'Окно', icon: PanelsTopLeft },
] as const;
export const furniture = [
  { id: 'bed', label: 'Кровать', icon: BedDouble, w: 1.8, h: 2 },
  { id: 'sofa', label: 'Диван', icon: Sofa, w: 2.4, h: 0.9 },
  { id: 'kitchen', label: 'Кухня', icon: CookingPot, w: 3, h: 0.6 },
  { id: 'bath', label: 'Ванна', icon: Bath, w: 0.75, h: 1.7 },
  { id: 'stairs', label: 'Лестница', icon: MoveUpRight, w: 1, h: 3 },
] as const;
