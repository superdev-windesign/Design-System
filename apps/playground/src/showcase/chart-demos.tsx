import { useState } from "react";
import {
  ActivityRingsCard,
  AreaChartCard,
  ContributionsCard,
  HeatmapChartCard,
  MostActiveDaysCard,
  RING_GOALS,
  RadialChartCard,
  SERIES_SWATCH,
  Stack,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  cx,
} from "@windesign/react";
import type { ActiveDay, RingGoal } from "@windesign/react";

/** Fuller demos for chart pages: the options each chart takes beyond its defaults. */

const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });

/** One day's goals, scaled from the demo goals by how much of them that day met. */
const goalsFor = (day: ActiveDay): RingGoal[] =>
  RING_GOALS.map((g, i) => ({ ...g, value: Math.round(g.goal * Math.min(1, day.progress * (0.85 + i * 0.12)) * 10) / 10 }));

/** Most Active Days in its calendar view, driving Activity Rings for the picked day. */
export function ActivityDaysDemo() {
  const [day, setDay] = useState<ActiveDay>({ date: new Date(2026, 9, 31), progress: 0.74 });
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
      <MostActiveDaysCard defaultView="calendar" selectedDate={day.date} onSelectDay={setDay} />
      <ActivityRingsCard title={dayName.format(day.date)} goals={goalsFor(day)} />
    </div>
  );
}

export function AreaDemo() {
  return (
    <Stack gap={4} className="w-full max-w-2xl">
      <AreaChartCard />
      <AreaChartCard title="Straight segments" curve="linear" defaultMode="overlap" />
    </Stack>
  );
}

function ColorChoice({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <ToggleButtonGroup
      aria-label="Colour"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[String(value)]}
      onSelectionChange={(keys) => onChange(Number([...keys][0]))}
      className="flex-wrap"
    >
      {SERIES_SWATCH.map((swatch, i) => (
        <ToggleButton key={i} id={String(i + 1)} size="sm" aria-label={`Series colour ${i + 1}`}>
          <span aria-hidden className={cx("size-3.5 rounded-full", swatch)} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function ContributionsDemo() {
  const [color, setColor] = useState(7);
  return (
    <Stack gap={3} className="w-full max-w-3xl">
      <ColorChoice value={color} onChange={setColor} />
      <ContributionsCard weeks={53} color={color} title="Contributions this year" />
      <Text size="sm" tone="secondary">
        A full year with weeks=53; any series colour with color (1–9).
      </Text>
    </Stack>
  );
}

export function HeatmapDemo() {
  const [color, setColor] = useState(6);
  return (
    <Stack gap={3} className="w-full max-w-2xl">
      <ColorChoice value={color} onChange={setColor} />
      <HeatmapChartCard color={color} />
    </Stack>
  );
}

export function RadialDemo() {
  return (
    <Stack gap={4} className="w-full max-w-2xl">
      <RadialChartCard />
      <RadialChartCard title="Storage, with tiles" showTiles />
    </Stack>
  );
}
