import type { ItemKind } from '../types';

export type FurnitureVariant = {
  id: string;
  label: string;
  w: number;
  h: number;
};
export const furnitureVariants: Partial<
  Record<ItemKind, readonly FurnitureVariant[]>
> = {
  bed: [
    { id: 'double', label: 'Двуспальная', w: 1.8, h: 2 },
    { id: 'single', label: 'Односпальная', w: 0.9, h: 2 },
    { id: 'king', label: 'Большая', w: 2.2, h: 2.2 },
  ],
  sofa: [
    { id: 'straight', label: 'Прямой', w: 2.4, h: 0.9 },
    { id: 'corner', label: 'Угловой', w: 2.8, h: 1.7 },
    { id: 'compact', label: 'Компактный', w: 1.6, h: 0.85 },
  ],
  kitchen: [
    { id: 'straight', label: 'Прямая', w: 3, h: 0.6 },
    { id: 'l-shaped', label: 'Г-образная', w: 3, h: 2 },
    { id: 'u-shaped', label: 'П-образная', w: 3, h: 2.4 },
  ],
  bath: [
    { id: 'standard', label: 'Ванна', w: 0.75, h: 1.7 },
    { id: 'corner', label: 'Угловая', w: 1.4, h: 1.4 },
    { id: 'shower', label: 'Душевая', w: 0.9, h: 0.9 },
  ],
  stairs: [
    { id: 'straight', label: 'Прямая', w: 1, h: 3 },
    { id: 'l-shaped', label: 'Г-образная', w: 2, h: 3 },
    { id: 'u-shaped', label: 'П-образная', w: 2.2, h: 3 },
  ],
};

export function getFurnitureVariant(kind: ItemKind, id?: string) {
  const variants = furnitureVariants[kind];
  return variants?.find((variant) => variant.id === id) ?? variants?.[0];
}
