"use client";

import { useState } from "react";
import { Button as AriaButton, Input, Label, NumberField } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { RiArrowUpDownLine } from "@remixicon/react";
import type { IconComponent } from "../../components/button/button";
import { easing } from "../../motion/tokens";
import { FIELD_INPUT } from "../../recipes/field";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { LiquidButton } from "./liquid-button";

/**
 * Swap box: exchange one thing for another. Two wells of glass hold the amounts,
 * and a lens between them flips the direction. Editing the top amount updates
 * the one below at `rate`, and flipping inverts the rate.
 */

export interface SwapAsset {
  id: string;
  symbol: string;
  icon?: IconComponent;
}

export interface SwapRequest {
  pay: SwapAsset;
  receive: SwapAsset;
  amount: number;
  received: number;
}

export interface SwapBoxProps {
  from: SwapAsset;
  to: SwapAsset;
  /** How much of `to` one `from` buys. */
  rate: number;
  defaultAmount?: number;
  onSwap?: (request: SwapRequest) => void;
  actionLabel?: string;
  className?: string;
}

/** What `amount` buys, going either way, to a sensible number of places. */
export function swapQuote(amount: number, rate: number, flipped: boolean) {
  const value = flipped ? amount / rate : amount * rate;
  return Number(value.toFixed(6));
}

function AssetChip({ asset }: { asset: SwapAsset }) {
  const Icon = asset.icon;
  return (
    <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-glass-hover px-3 text-body-sm-strong text-fg">
      {Icon && <Icon aria-hidden className="size-4" />}
      {asset.symbol}
    </span>
  );
}

const WELL = "flex items-center gap-3 rounded-overlay bg-glass-well p-3 shadow-glass-bevel";

export function SwapBox({ from, to, rate, defaultAmount = 1, onSwap, actionLabel = "Swap", className }: SwapBoxProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [flipped, setFlipped] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const pay = flipped ? to : from;
  const receive = flipped ? from : to;
  const received = swapQuote(Number.isNaN(amount) ? 0 : amount, rate, flipped);

  return (
    <section className={cx("glass-panel glass-slab flex w-full max-w-sm flex-col gap-3 rounded-panel border p-3", className)}>
      <div className="relative flex flex-col gap-1.5">
        <NumberField aria-label={`You pay, in ${pay.symbol}`} minValue={0} value={amount} onChange={setAmount} formatOptions={{ maximumFractionDigits: 6 }}>
          <div className={WELL}>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Label className="text-body-sm text-fg-secondary">You pay</Label>
              <Input className={cx(FIELD_INPUT, "text-title-lg-strong tabular-nums")} />
            </div>
            <AssetChip asset={pay} />
          </div>
        </NumberField>
        <div className={WELL}>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-body-sm text-fg-secondary">You receive</span>
            <output aria-label={`You receive, in ${receive.symbol}`} className="truncate text-title-lg-strong tabular-nums text-fg">
              {received.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </output>
          </div>
          <AssetChip asset={receive} />
        </div>
        <AriaButton
          aria-label="Flip direction"
          onPress={() => setFlipped((on) => !on)}
          className={cx("glass-panel absolute start-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border text-fg shadow-glass-lens rtl:translate-x-1/2", focusRing)}
        >
          <motion.span animate={{ rotate: flipped ? 180 : 0 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: easing.overshoot }}>
            <RiArrowUpDownLine aria-hidden className="size-5" />
          </motion.span>
        </AriaButton>
      </div>
      <LiquidButton variant="glow" size="sm" isDisabled={!amount} onPress={() => onSwap?.({ pay, receive, amount, received })} className="w-full">
        {actionLabel}
      </LiquidButton>
    </section>
  );
}
