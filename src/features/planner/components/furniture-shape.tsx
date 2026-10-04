import type { PlanItem } from '../types';
import { getFurnitureVariant } from '../model/furniture';

export function FurnitureShape({ item }: { item: PlanItem }) {
  const variant = getFurnitureVariant(item.kind, item.variant)?.id;
  const outline = {
    stroke: '#8292a3',
    strokeWidth: 0.025,
    vectorEffect: 'non-scaling-stroke' as const,
  };
  return (
    <g transform={`scale(${item.w} ${item.h})`}>
      {item.kind === 'bed' ? (
        <>
          <rect
            x=".02"
            y=".02"
            width=".96"
            height=".96"
            rx=".04"
            fill="#fcfcfd"
            stroke="#8292a3"
            strokeWidth=".018"
          />
          <rect
            x=".02"
            y=".02"
            width=".96"
            height=".08"
            rx=".025"
            fill="#b9a99b"
          />
          {(variant === 'single' ? [0.1] : [0.08, 0.54]).map((x) => (
            <rect
              key={x}
              x={x}
              y=".13"
              width={variant === 'single' ? 0.8 : 0.38}
              height=".2"
              rx=".045"
              fill="#fff"
              stroke="#aab6c4"
              strokeWidth=".012"
            />
          ))}
          <rect
            x=".06"
            y=".38"
            width=".88"
            height=".56"
            rx=".025"
            fill="#dbe5ee"
            stroke="#aab6c4"
            strokeWidth=".012"
          />
          <path
            d="M .06 .48 H .94 M .1 .91 H .9"
            fill="none"
            stroke="#bccad7"
            strokeWidth=".016"
          />
        </>
      ) : item.kind === 'sofa' ? (
        <>
          <path
            d={
              variant === 'corner'
                ? 'M .02 .02 H .98 V .98 H .65 V .53 H .02 Z'
                : 'M .02 .02 H .98 V .98 H .02 Z'
            }
            fill="#f9fafb"
            stroke="#8796a7"
            strokeWidth=".018"
          />
          <rect
            x=".06"
            y=".07"
            width=".88"
            height={variant === 'corner' ? 0.09 : 0.16}
            rx=".035"
            fill="#b8c6d4"
          />
          {Array.from({ length: variant === 'compact' ? 2 : 3 }, (_, n) => (
            <rect
              key={n}
              x={0.09 + n * (0.82 / (variant === 'compact' ? 2 : 3))}
              y={variant === 'corner' ? 0.19 : 0.3}
              width={0.82 / (variant === 'compact' ? 2 : 3) - 0.02}
              height={variant === 'corner' ? 0.28 : 0.55}
              rx=".045"
              fill="#dde5ed"
              stroke="#a7b6c6"
              strokeWidth=".009"
            />
          ))}
          {variant === 'corner' ? (
            <rect
              x=".7"
              y=".51"
              width=".23"
              height=".41"
              rx=".03"
              fill="#dde5ed"
              stroke="#a7b6c6"
              strokeWidth=".01"
            />
          ) : null}
        </>
      ) : item.kind === 'kitchen' ? (
        <KitchenShape item={item} variant={variant} />
      ) : item.kind === 'stairs' ? (
        <StairShape variant={variant} />
      ) : item.kind === 'bath' ? (
        <>
          <rect
            x=".02"
            y=".02"
            width=".96"
            height=".96"
            rx={variant === 'corner' ? 0.3 : 0.08}
            fill="#fafcfd"
            stroke="#839daa"
            strokeWidth=".022"
          />
          {variant === 'shower' ? (
            <>
              <path
                d="M .08 .08 L .92 .92 M .92 .08 L .08 .92"
                stroke="#c6dce4"
                strokeWidth=".015"
              />
              <circle cx=".5" cy=".5" r=".065" fill="#adc5cf" />
              <path
                d="M .05 .05 H .95 V .95"
                fill="none"
                stroke="#87b2c4"
                strokeWidth=".04"
              />
            </>
          ) : (
            <>
              <rect
                x=".12"
                y=".09"
                width=".76"
                height=".82"
                rx={variant === 'corner' ? 0.3 : 0.28}
                fill="#e3f0f5"
                stroke="#a8c1ce"
                strokeWidth=".018"
              />
              <circle cx=".5" cy=".2" r=".035" fill="#96adba" />
              <path d="M .5 .03 V .13" stroke="#798e9b" strokeWidth=".035" />
            </>
          )}
        </>
      ) : (
        <rect width="1" height="1" fill="#fff" {...outline} />
      )}
    </g>
  );
}

function KitchenShape({ item, variant }: { item: PlanItem; variant?: string }) {
  const top = variant === 'straight' ? 1 : Math.min(0.5, 0.6 / item.h);
  const side = Math.min(0.4, 0.6 / item.w);
  const contour =
    variant === 'l-shaped'
      ? `M 0 0 H 1 V ${top} H ${side} V 1 H 0 Z`
      : variant === 'u-shaped'
        ? `M 0 0 H 1 V 1 H ${1 - side} V ${top} H ${side} V 1 H 0 Z`
        : 'M 0 0 H 1 V 1 H 0 Z';
  return (
    <>
      <path d={contour} fill="#ece4d8" stroke="#8b8173" strokeWidth=".018" />
      <path
        d={`M .02 ${top * 0.88} H .98`}
        stroke="#b0a28d"
        strokeWidth=".012"
      />
      {Array.from({ length: 5 }, (_, n) => (
        <path
          key={n}
          d={`M ${(n + 1) / 6} .02 V ${top * 0.85}`}
          stroke="#c0b3a1"
          strokeWidth=".007"
        />
      ))}
      <rect
        x=".12"
        y={top * 0.13}
        width=".2"
        height={top * 0.62}
        rx=".025"
        fill="#adc2cc"
        stroke="#798f9d"
        strokeWidth=".009"
      />
      <rect
        x=".135"
        y={top * 0.2}
        width=".17"
        height={top * 0.45}
        rx=".02"
        fill="#dce9ee"
      />
      <ellipse
        cx=".225"
        cy={top * 0.47}
        rx=".014"
        ry={top * 0.028}
        fill="#8ca4b0"
      />
      <path
        d={`M .23 ${top * 0.1} Q .27 ${top * 0.08} .27 ${top * 0.27}`}
        fill="none"
        stroke="#647f8c"
        strokeWidth=".012"
      />
      <rect
        x=".57"
        y={top * 0.1}
        width=".22"
        height={top * 0.7}
        rx=".015"
        fill="#38424c"
      />
      {[0.625, 0.735].flatMap((x) =>
        [top * 0.3, top * 0.6].map((y) => (
          <ellipse
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            rx=".035"
            ry={top * 0.105}
            fill="none"
            stroke="#aeb9c3"
            strokeWidth=".012"
          />
        )),
      )}
      {variant !== 'straight' ? (
        <>
          <path
            d={`M ${side * 0.88} ${top} V .98`}
            stroke="#b0a28d"
            strokeWidth=".01"
          />
          {[0.45, 0.65, 0.85].map((y) => (
            <path
              key={y}
              d={`M .02 ${y} H ${side * 0.85}`}
              stroke="#c0b3a1"
              strokeWidth=".008"
            />
          ))}
          {variant === 'u-shaped' ? (
            <path
              d={`M ${1 - side * 0.88} ${top} V .98 M ${1 - side} .5 H .98 M ${1 - side} .75 H .98`}
              stroke="#b0a28d"
              strokeWidth=".01"
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

function StairShape({ variant }: { variant?: string }) {
  const turning = variant !== 'straight';
  const width = turning ? 0.43 : 1;
  return (
    <>
      <path
        d={
          variant === 'l-shaped'
            ? 'M 0 0 H .43 V .7 H 1 V 1 H 0 Z'
            : 'M 0 0 H 1 V 1 H 0 Z'
        }
        fill="#f3f0eb"
        stroke="#8593a1"
        strokeWidth=".018"
      />
      {Array.from({ length: 10 }, (_, n) => (
        <line
          key={n}
          x1="0"
          x2={width}
          y1={0.1 + n * 0.085}
          y2={0.1 + n * 0.085}
          stroke="#9ba7b2"
          strokeWidth=".01"
        />
      ))}
      <path
        d={`M ${width / 2} .86 V .16 l -.07 .08 M ${width / 2} .16 l .07 .08`}
        fill="none"
        stroke="#647c91"
        strokeWidth=".014"
      />
      {variant === 'u-shaped' ? (
        <>
          <rect
            x="0"
            y="0"
            width="1"
            height=".18"
            fill="#e3ddd3"
            stroke="#9ba7b2"
            strokeWidth=".012"
          />
          {Array.from({ length: 10 }, (_, n) => (
            <line
              key={n}
              x1=".57"
              x2="1"
              y1={0.22 + n * 0.077}
              y2={0.22 + n * 0.077}
              stroke="#9ba7b2"
              strokeWidth=".01"
            />
          ))}
          <path
            d="M .785 .25 V .88 l -.07 -.08 M .785 .88 l .07 -.08"
            fill="none"
            stroke="#647c91"
            strokeWidth=".014"
          />
          <rect
            x=".43"
            y=".18"
            width=".14"
            height=".82"
            fill="#fff"
            stroke="#aab5bf"
            strokeWidth=".01"
          />
        </>
      ) : variant === 'l-shaped' ? (
        <>
          {Array.from({ length: 6 }, (_, n) => (
            <line
              key={n}
              x1={0.46 + n * 0.09}
              x2={0.46 + n * 0.09}
              y1=".7"
              y2="1"
              stroke="#9ba7b2"
              strokeWidth=".01"
            />
          ))}
          <path
            d="M .48 .85 H .9 l -.08 -.06 M .9 .85 l -.08 .06"
            fill="none"
            stroke="#647c91"
            strokeWidth=".014"
          />
        </>
      ) : null}
    </>
  );
}
