"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiArrowDownSLine, RiArrowUpSLine, RiSubtractLine } from "@remixicon/react";
import { Avatar } from "../../components/avatar/avatar";
import { Button } from "../../components/button/button";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { layoutSpring } from "../../motion/tokens";
import { cx } from "../../utils/cx";

/**
 * Leaderboard, after Moon's: each player is a white card on the page, with the
 * top three's ranks in solid black. Rows glide to their new place when the
 * period changes, and can say how far a player moved. Your own row stays
 * pinned below the list while you're ranked outside what's showing, so you
 * never have to scroll to find it.
 */

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  /** Photo shown beside the name. */
  avatar?: string;
  /** Places moved since the last period: positive is up. */
  change?: number;
}

export interface LeaderboardPeriod {
  id: string;
  label: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardProps {
  title?: ReactNode;
  /** One board per period, switched with the control in the header. */
  periods?: LeaderboardPeriod[];
  /** A single board, when there are no periods to switch between. */
  entries?: LeaderboardEntry[];
  /** Whose row to highlight, and pin when it's off the list. */
  currentUserId?: string;
  /** Rows shown before "Show more". Default 5. */
  pageSize?: number;
  formatScore?: (score: number) => ReactNode;
  scoreLabel?: string;
  nameLabel?: string;
  className?: string;
}

/** The top three stand out in solid black; your own rank takes the accent. */
function Rank({ rank, isYou }: { rank: number; isYou: boolean }) {
  return (
    <span
      className={cx(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-body-sm-strong tabular-nums",
        isYou ? "bg-accent-600 text-on-action" : rank <= 3 ? "bg-fg text-canvas" : "bg-canvas text-fg",
      )}
    >
      {rank}
    </span>
  );
}

function Movement({ change = 0 }: { change?: number }) {
  if (change === 0) {
    return (
      <span className="flex w-9 shrink-0 items-center justify-end text-fg-tertiary">
        <RiSubtractLine aria-hidden className="size-4" />
        <span className="sr-only">No change</span>
      </span>
    );
  }
  const up = change > 0;
  const Icon = up ? RiArrowUpSLine : RiArrowDownSLine;
  return (
    <span className={cx("flex w-9 shrink-0 items-center justify-end text-caption tabular-nums", up ? "text-status-success-text" : "text-status-danger-text")}>
      <Icon aria-hidden className="size-4" />
      <span aria-hidden>{Math.abs(change)}</span>
      <span className="sr-only">{`${up ? "Up" : "Down"} ${Math.abs(change)}`}</span>
    </span>
  );
}

interface RowProps {
  entry: LeaderboardEntry;
  rank: number;
  isYou: boolean;
  formatScore: (score: number) => ReactNode;
}

function Row({ entry, rank, isYou, formatScore }: RowProps) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-item bg-surface px-3">
      <Rank rank={rank} isYou={isYou} />
      {entry.avatar && <Avatar size="sm" src={entry.avatar} alt="" />}
      <span className="min-w-0 flex-1 truncate text-body-md text-fg">
        {entry.name}
        {isYou && <span className="ms-1.5 text-caption text-fg-secondary">You</span>}
      </span>
      {entry.change !== undefined && <Movement change={entry.change} />}
      <span className="shrink-0 text-end text-body-md tabular-nums text-fg">{formatScore(entry.score)}</span>
    </div>
  );
}

const defaultScore = (score: number) => new Intl.NumberFormat().format(score);

export function Leaderboard({
  title = "Leaderboard",
  periods,
  entries,
  currentUserId,
  pageSize = 5,
  formatScore = defaultScore,
  scoreLabel = "Score",
  nameLabel = "Player",
  className,
}: LeaderboardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [periodId, setPeriodId] = useState(periods?.[0]?.id);
  const [expanded, setExpanded] = useState(false);

  const source = periods ? (periods.find((p) => p.id === periodId) ?? periods[0])?.entries : entries;
  const ranked = useMemo(() => [...(source ?? [])].sort((a, b) => b.score - a.score), [source]);

  const shown = expanded ? ranked : ranked.slice(0, pageSize);
  const yourRank = currentUserId ? ranked.findIndex((entry) => entry.id === currentUserId) : -1;
  const youAreOffList = yourRank >= shown.length;

  return (
    <section aria-label={typeof title === "string" ? title : "Leaderboard"} className={cx("flex w-full max-w-xl flex-col gap-2", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-title-sm-strong text-fg">{title}</h3>
        {periods && periods.length > 1 && (
          <SegmentedControl
            aria-label="Period"
            selectedKeys={periodId ? [periodId] : []}
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (next) {
                setPeriodId(String(next));
                setExpanded(false);
              }
            }}
          >
            {periods.map((period) => (
              <SegmentedControlItem key={period.id} id={period.id}>
                {period.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        )}
      </header>

      <div aria-hidden className="flex items-center gap-3 px-3 text-caption text-fg-secondary">
        <span className="w-8 shrink-0 text-center">#</span>
        <span className="flex-1">{nameLabel}</span>
        <span className="shrink-0 text-end">{scoreLabel}</span>
      </div>

      {ranked.length === 0 ? (
        <p className="px-2 py-6 text-center text-body-sm text-fg-secondary">No scores yet.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((entry, index) => (
              <motion.li
                key={entry.id}
                layout={!reduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : layoutSpring}
              >
                <Row entry={entry} rank={index + 1} isYou={entry.id === currentUserId} formatScore={formatScore} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      {youAreOffList && (
        <div className="pt-2">
          <Row entry={ranked[yourRank]!} rank={yourRank + 1} isYou formatScore={formatScore} />
        </div>
      )}

      {ranked.length > pageSize && (
        <Button variant="tertiary" size="sm" onPress={() => setExpanded((open) => !open)} className="self-center">
          {expanded ? "Show less" : `Show all ${ranked.length}`}
        </Button>
      )}
    </section>
  );
}
