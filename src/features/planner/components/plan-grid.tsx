import { useId } from 'react';

export function useGridPatternId() {
  return `plan-grid-${useId().replace(/:/g, '')}`;
}

export function PlanGrid({ id, visible }: { id: string; visible: boolean }) {
  return (
    <>
      <defs>
        <pattern
          id={`${id}-minor`}
          width=".1"
          height=".1"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M .1 0 L 0 0 0 .1"
            fill="none"
            stroke="#b8c5d5"
            strokeWidth=".5"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern id={id} width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill={`url(#${id}-minor)`} />
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="#8d9fb5"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>
      <rect width="24" height="20" fill="#fff" />
      {visible ? (
        <rect
          data-plan-grid="true"
          width="24"
          height="20"
          fill={`url(#${id})`}
          pointerEvents="none"
        />
      ) : null}
      <rect
        width="24"
        height="20"
        fill="none"
        stroke="#8d9fb5"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />
      <g className="plan-rulers" pointerEvents="none" aria-hidden="true">
        {Array.from({ length: 25 }, (_, n) => (
          <text key={`x-${n}`} x={n} y="-.35" className="ruler">
            {n}
          </text>
        ))}
        {Array.from({ length: 21 }, (_, n) => (
          <text
            key={`y-${n}`}
            x="-.4"
            y={n}
            dominantBaseline="middle"
            className="ruler"
          >
            {n}
          </text>
        ))}
      </g>
    </>
  );
}
