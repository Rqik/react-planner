import { useId } from 'react';
import type { PlanItem, PlanPointerEvent } from '../types';
type Props = {
  item: PlanItem;
  selected: boolean;
  gridFill?: string;
  onPointerDown: (event: PlanPointerEvent, id?: string) => void;
};
export function PlanObject({
  item: i,
  selected,
  gridFill,
  onPointerDown: down,
}: Props) {
  const clipId = `room-grid-${useId().replace(/:/g, '')}`;
  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        down(e, i.id);
      }}
      transform={`translate(${i.x} ${i.y})`}
    >
      <g transform={`rotate(${i.rotation} ${i.w / 2} ${i.h / 2})`}>
        {i.kind === 'room' ? (
          <>
            <rect
              width={i.w}
              height={i.h}
              fill={i.color}
              stroke="#35414e"
              strokeWidth=".13"
            />
            {gridFill ? (
              <>
                <defs>
                  <clipPath id={clipId}>
                    <rect width={i.w} height={i.h} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId})`} pointerEvents="none">
                  <rect
                    transform={`translate(${-i.x} ${-i.y})`}
                    width="24"
                    height="20"
                    fill={gridFill}
                    opacity=".6"
                  />
                </g>
              </>
            ) : null}
            <text
              x={i.w / 2}
              y={i.h / 2 - 0.1}
              textAnchor="middle"
              fontSize={Math.min(0.32, i.w * 0.1)}
              fill="#243343"
              fontWeight="550"
            >
              {i.name}
            </text>
            <text
              x={i.w / 2}
              y={i.h / 2 + 0.36}
              textAnchor="middle"
              fontSize=".26"
              fill="#788594"
            >
              {(i.w * i.h).toFixed(1)} м²
            </text>
            <text
              x={i.w / 2}
              y={i.h - 0.25}
              textAnchor="middle"
              fontSize=".2"
              fill="#85919c"
            >
              {i.w.toFixed(1)} × {i.h.toFixed(1)} м
            </text>
          </>
        ) : i.kind === 'wall' ? (
          <rect width={i.w} height={i.h} fill="#35414e" />
        ) : i.kind === 'door' ? (
          <>
            <rect width={i.w} height=".18" y="-.09" fill="white" />
            <path
              d={`M 0 0 L 0 ${i.h} M 0 ${i.h} A ${i.w} ${i.h} 0 0 0 ${i.w} 0`}
              fill="none"
              stroke="#738396"
              strokeWidth=".035"
            />
          </>
        ) : i.kind === 'window' ? (
          <>
            <rect
              width={i.w}
              height={i.h}
              fill="white"
              stroke="#547e98"
              strokeWidth=".05"
            />
            <path
              d={`M 0 ${i.h / 2} H ${i.w}`}
              stroke="#547e98"
              strokeWidth=".025"
            />
          </>
        ) : (
          <>
            <rect
              width={i.w}
              height={i.h}
              rx=".08"
              fill="#fcfcfd"
              stroke="#8f9cab"
              strokeWidth=".035"
            />
            {i.kind === 'bed' && (
              <>
                <rect
                  x=".1"
                  y=".1"
                  width={i.w / 2 - 0.15}
                  height=".4"
                  rx=".08"
                  fill="#edf0f4"
                  stroke="#a3adb9"
                  strokeWidth=".02"
                />
                <rect
                  x={i.w / 2 + 0.03}
                  y=".1"
                  width={i.w / 2 - 0.15}
                  height=".4"
                  rx=".08"
                  fill="#edf0f4"
                  stroke="#a3adb9"
                  strokeWidth=".02"
                />
                <path
                  d={`M .1 .65 H ${i.w - 0.1}`}
                  stroke="#a3adb9"
                  strokeWidth=".025"
                />
              </>
            )}
            {i.kind === 'sofa' && (
              <>
                <rect
                  x=".18"
                  y=".2"
                  width={i.w - 0.36}
                  height={i.h - 0.32}
                  rx=".08"
                  fill="#e6e9ef"
                />
                <path
                  d={`M ${i.w / 2} .2 V ${i.h - 0.1}`}
                  stroke="#a3adb9"
                  strokeWidth=".025"
                />
              </>
            )}
            {i.kind === 'stairs' &&
              Array.from({ length: 12 }, (_, n) => (
                <line
                  key={n}
                  x1="0"
                  x2={i.w}
                  y1={(n * i.h) / 12}
                  y2={(n * i.h) / 12}
                  stroke="#a3adb9"
                  strokeWidth=".02"
                />
              ))}
            {i.kind === 'bath' && (
              <rect
                x=".09"
                y=".1"
                width={i.w - 0.18}
                height={i.h - 0.2}
                rx=".25"
                fill="#edf4f6"
                stroke="#9ab3bd"
                strokeWidth=".025"
              />
            )}
            {i.kind === 'kitchen' &&
              Array.from({ length: Math.floor(i.w / 0.6) }, (_, n) => (
                <rect
                  key={n}
                  x={n * 0.6 + 0.05}
                  y=".07"
                  width=".5"
                  height={i.h - 0.14}
                  fill="#edf0f4"
                  stroke="#a3adb9"
                  strokeWidth=".02"
                />
              ))}
          </>
        )}
      </g>
      {selected && (
        <g data-selection="true">
          <rect
            x="-.1"
            y="-.1"
            width={i.w + 0.2}
            height={i.h + 0.2}
            fill="none"
            stroke="#db6545"
            strokeDasharray=".1 .07"
            strokeWidth=".04"
          />
          {[
            [0, 0],
            [i.w, 0],
            [0, i.h],
            [i.w, i.h],
          ].map(([x, y], n) => (
            <rect
              key={n}
              x={x - 0.07}
              y={y - 0.07}
              width=".14"
              height=".14"
              fill="white"
              stroke="#db6545"
              strokeWidth=".035"
            />
          ))}
        </g>
      )}
    </g>
  );
}
