import { seed, room, type Project } from './project';
export function createTemplate(kind: string): Project {
  let p: Project = structuredClone(seed);
  if (kind === 'empty') p = { name: 'Новый проект', floors: [[]] };
  if (kind === 'single')
    p = {
      name: 'Одноэтажный дом',
      floors: [
        [
          room('s1', 'Кухня-гостиная', 3, 3, 6, 5, '#edf0e8'),
          room('s2', 'Спальня', 9, 3, 4, 4, '#e8edf4'),
          room('s3', 'Детская', 3, 8, 3, 4, '#f3eee7'),
          room('s4', 'Детская', 6, 8, 3, 4, '#e8efeb'),
          room('s5', 'Холл', 9, 7, 4, 2),
          room('s6', 'Ванная', 9, 9, 2.5, 3, '#e5f0f2'),
          room('s7', 'Туалет', 11.5, 9, 1.5, 3, '#e5f0f2'),
        ],
      ],
    };
  return p;
}
