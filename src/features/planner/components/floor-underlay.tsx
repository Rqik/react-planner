import { useMemo } from 'react';
import type { PlanItem } from '../types';
import { exteriorWalls } from '../model/exterior-walls';

export function FloorUnderlay({
  items,
  walls,
  rooms,
}: {
  items: PlanItem[];
  walls: boolean;
  rooms: boolean;
}) {
  const outline = useMemo(() => exteriorWalls(items), [items]);
  return (
    <g
      data-underlay="true"
      pointerEvents="none"
      opacity=".45"
      aria-hidden="true"
    >
      {rooms
        ? items
            .filter((item) => item.kind === 'room')
            .map((item) => (
              <g key={item.id}>
                <rect
                  x={item.x}
                  y={item.y}
                  width={item.w}
                  height={item.h}
                  fill="#78add5"
                  fillOpacity=".1"
                  stroke="#3979aa"
                  strokeWidth=".025"
                  strokeDasharray=".12 .08"
                />
                <text
                  x={item.x + 0.15}
                  y={item.y + 0.4}
                  fontSize=".22"
                  fill="#3979aa"
                >
                  ↓ {item.name}
                </text>
              </g>
            ))
        : null}
      {walls
        ? [
            ...outline,
            ...items.filter(
              (item) => item.kind === 'wall' && item.wallType !== 'exterior',
            ),
          ].map((item) => (
            <rect
              key={item.id}
              x={item.x}
              y={item.y}
              width={item.w}
              height={item.h}
              fill="#4784b5"
              stroke="#3979aa"
              strokeWidth=".018"
              strokeDasharray=".12 .08"
              transform={`rotate(${item.rotation} ${item.x + item.w / 2} ${item.y + item.h / 2})`}
            />
          ))
        : null}
    </g>
  );
}
