"use client";

import { useState } from "react";
import { Layer, Rectangle, ResponsiveContainer, Sankey } from "recharts";
import { ChartCard, format, seriesColor } from "../shared/chart-card";

/**
 * Sankey Chart: how a total splits into parts and sub-parts. Each link takes
 * its source's colour at low opacity; hovering a link or node brings it
 * forward and shows the amount and its share of the total in the header.
 */

export interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

/** Where a quarter's revenue went, in $k. */
export const SANKEY_DATA: SankeyData = {
  nodes: [
    { name: "Revenue" }, // 0
    { name: "Salaries" }, // 1
    { name: "Marketing" }, // 2
    { name: "Infrastructure" }, // 3
    { name: "Profit" }, // 4
    { name: "Ads" }, // 5
    { name: "Events" }, // 6
    { name: "Cloud" }, // 7
    { name: "Tools" }, // 8
  ],
  links: [
    { source: 0, target: 1, value: 420 },
    { source: 0, target: 2, value: 180 },
    { source: 0, target: 3, value: 140 },
    { source: 0, target: 4, value: 260 },
    { source: 2, target: 5, value: 120 },
    { source: 2, target: 6, value: 60 },
    { source: 3, target: 7, value: 95 },
    { source: 3, target: 8, value: 45 },
  ],
};

type Hover = { label: string; value: number } | null;

export interface SankeyChartCardProps {
  data?: SankeyData;
  title?: string;
  /** Formats link and node amounts. */
  formatValue?: (value: number) => string;
  className?: string;
}

export function SankeyChartCard({
  data = SANKEY_DATA,
  title = "Where revenue went",
  formatValue = (v) => `$${format.number(v)}k`,
  className,
}: SankeyChartCardProps) {
  const [hover, setHover] = useState<Hover>(null);
  const total = data.links.filter((l) => l.source === 0).reduce((s, l) => s + l.value, 0);
  // A node's colour index: first-level children get their own colour, deeper nodes inherit their parent's.
  const colorOf = (index: number): number => {
    if (index === 0) return 6;
    const parent = data.links.find((l) => l.target === index)?.source ?? 0;
    return parent === 0 ? (index % 9) + 1 : colorOf(parent);
  };

  return (
    <ChartCard
      title={hover ? hover.label : title}
      value={formatValue(hover?.value ?? total)}
      valueKey={hover?.label ?? "total"}
      caption={hover ? `${format.percent(hover.value / total)} of the total` : "Total, split by category"}
      summary={`${title}: ${formatValue(total)} in total. ${data.links
        .map((l) => `${data.nodes[l.source]?.name} to ${data.nodes[l.target]?.name} ${formatValue(l.value)}`)
        .join(", ")}.`}
      plotClassName="h-64"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={18}
          nodeWidth={10}
          linkCurvature={0.5}
          iterations={48}
          margin={{ top: 22, right: 96, bottom: 4, left: 4 }}
          onMouseLeave={() => setHover(null)}
          node={(props) => {
            const { x, y, width, height, index, payload } = props;
            const color = seriesColor(colorOf(index));
            return (
              <Layer key={`node-${index}`}>
                <Rectangle
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  radius={3}
                  fill={color}
                  onMouseEnter={() => setHover({ label: payload.name, value: payload.value })}
                />
                {/* Leaves are labelled beside the node; nodes that branch on, above it, clear of their bands. */}
                <text
                  x={data.links.some((l) => l.source === index) ? x : x + width + 6}
                  y={data.links.some((l) => l.source === index) ? y - 8 : y + height / 2}
                  dominantBaseline={data.links.some((l) => l.source === index) ? "auto" : "middle"}
                  className="fill-fg-secondary text-caption"
                >
                  {payload.name}
                </text>
              </Layer>
            );
          }}
          link={(props) => {
            const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props;
            const sourceIndex = data.nodes.findIndex((n) => n.name === payload.source.name);
            const label = `${payload.source.name} → ${payload.target.name}`;
            const isHovered = hover?.label === label;
            return (
              <path
                key={`link-${index}`}
                d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
                fill="none"
                stroke={seriesColor(colorOf(sourceIndex === 0 ? data.nodes.findIndex((n) => n.name === payload.target.name) : sourceIndex))}
                strokeOpacity={isHovered ? 0.55 : 0.22}
                strokeWidth={linkWidth}
                className="transition-[stroke-opacity] duration-(--ds-motion-duration-base)"
                onMouseEnter={() => setHover({ label, value: payload.value })}
              />
            );
          }}
        />
      </ResponsiveContainer>
    </ChartCard>
  );
}
