import type { PlanItem, PlanPointerEvent, ResizeSide } from '../types';

type Props = {
  item: PlanItem;
  onResize: (event: PlanPointerEvent, id: string, side: ResizeSide) => void;
};

export function RoomResizeHandles({ item, onResize }: Props) {
  const sides = [
    {
      side: 'left',
      label: 'Левая сторона комнаты',
      x: 0,
      y: item.h / 2,
      vertical: true,
    },
    {
      side: 'right',
      label: 'Правая сторона комнаты',
      x: item.w,
      y: item.h / 2,
      vertical: true,
    },
    {
      side: 'top',
      label: 'Верхняя сторона комнаты',
      x: item.w / 2,
      y: 0,
      vertical: false,
    },
    {
      side: 'bottom',
      label: 'Нижняя сторона комнаты',
      x: item.w / 2,
      y: item.h,
      vertical: false,
    },
  ] as const;
  return (
    <g data-selection="true" transform={`translate(${item.x} ${item.y})`}>
      {sides.map(({ side, label, x, y, vertical }) => (
        <g
          key={side}
          className="room-resize-handle"
          style={{ cursor: vertical ? 'ew-resize' : 'ns-resize' }}
          onPointerDown={(e) => onResize(e, item.id, side)}
          aria-label={label}
        >
          <rect
            data-resize-side={side}
            x={vertical ? x - 0.16 : 0}
            y={vertical ? 0 : y - 0.16}
            width={vertical ? 0.32 : item.w}
            height={vertical ? item.h : 0.32}
            fill="transparent"
            pointerEvents="all"
          >
            <title>{label}: потяните для изменения размера</title>
          </rect>
          <rect
            x={x - (vertical ? 0.08 : 0.25)}
            y={y - (vertical ? 0.25 : 0.08)}
            width={vertical ? 0.16 : 0.5}
            height={vertical ? 0.5 : 0.16}
            rx=".04"
            fill="white"
            stroke="#db6545"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        </g>
      ))}
    </g>
  );
}
