import type { PlanItem } from '../types';

// Find exposed edges of the union of room rectangles, including recessed facades.
export function exteriorWalls(items: PlanItem[]): PlanItem[] {
  const rooms = items.filter((item) => item.kind === 'room');
  const segments = new Map<
    string,
    { vertical: boolean; axis: number; start: number; end: number }[]
  >();
  for (const room of rooms) {
    for (const edge of [
      {
        vertical: true,
        axis: room.x,
        start: room.y,
        end: room.y + room.h,
        outside: room.x - 0.0001,
      },
      {
        vertical: true,
        axis: room.x + room.w,
        start: room.y,
        end: room.y + room.h,
        outside: room.x + room.w + 0.0001,
      },
      {
        vertical: false,
        axis: room.y,
        start: room.x,
        end: room.x + room.w,
        outside: room.y - 0.0001,
      },
      {
        vertical: false,
        axis: room.y + room.h,
        start: room.x,
        end: room.x + room.w,
        outside: room.y + room.h + 0.0001,
      },
    ]) {
      const covered = rooms
        .filter((other) =>
          edge.vertical
            ? other.x < edge.outside && other.x + other.w > edge.outside
            : other.y < edge.outside && other.y + other.h > edge.outside,
        )
        .map((other) => ({
          start: Math.max(edge.start, edge.vertical ? other.y : other.x),
          end: Math.min(
            edge.end,
            edge.vertical ? other.y + other.h : other.x + other.w,
          ),
        }))
        .filter((interval) => interval.end > interval.start)
        .sort((a, b) => a.start - b.start);
      const gaps: { start: number; end: number }[] = [];
      let cursor = edge.start;
      for (const interval of covered) {
        if (interval.start > cursor + 1e-6)
          gaps.push({ start: cursor, end: interval.start });
        cursor = Math.max(cursor, interval.end);
      }
      if (cursor < edge.end - 1e-6) gaps.push({ start: cursor, end: edge.end });
      for (const { start, end } of gaps) {
        const key = `${edge.vertical}:${edge.axis.toFixed(6)}`;
        segments.set(key, [
          ...(segments.get(key) ?? []),
          { ...edge, start, end },
        ]);
      }
    }
  }
  const result: PlanItem[] = [];
  for (const list of segments.values()) {
    const sorted = list.sort((a, b) => a.start - b.start);
    const merged: typeof list = [];
    for (const segment of sorted) {
      const last = merged.at(-1);
      if (last && segment.start <= last.end + 1e-6)
        last.end = Math.max(last.end, segment.end);
      else merged.push({ ...segment });
    }
    for (const segment of merged) {
      const x = segment.vertical
        ? Math.max(0, Math.min(23.9, segment.axis - 0.05))
        : segment.start;
      const y = segment.vertical
        ? segment.start
        : Math.max(0, Math.min(19.9, segment.axis - 0.05));
      result.push({
        id: crypto.randomUUID(),
        kind: 'wall',
        name: 'Внешняя стена',
        x: Number(x.toFixed(6)),
        y: Number(y.toFixed(6)),
        w: segment.vertical
          ? 0.1
          : Number((segment.end - segment.start).toFixed(6)),
        h: segment.vertical
          ? Number((segment.end - segment.start).toFixed(6))
          : 0.1,
        rotation: 0,
        color: '#35414e',
        wallType: 'exterior',
      });
    }
  }
  return [
    ...result,
    ...items
      .filter((item) => item.kind === 'wall' && item.wallType === 'exterior')
      .map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        groupId: undefined,
      })),
  ];
}
