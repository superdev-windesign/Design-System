"use client";

import { useState, type ReactNode } from "react";
import { RiBankCardLine, RiCheckLine } from "@remixicon/react";
import { cx } from "../../utils/cx";
import { JoinedField, JoinedFields } from "./joined-field";

/**
 * Payment fields: card details as one joined group, the way a card is read.
 * The number groups itself as you type and works out the card network, the
 * expiry adds its slash, and the security code's length follows the network.
 * Each field checks itself when you leave it, so nobody is told off mid-typing.
 *
 * This is the input surface only: it validates shape, never charges, and
 * stores nothing. For a real payment, hand the values straight to a PCI
 * compliant provider's tokenizer rather than to your own server.
 */

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export interface PaymentValue {
  name: string;
  /** Digits only. */
  number: string;
  /** "MM/YY". */
  expiry: string;
  cvc: string;
  brand: CardBrand;
  isValid: boolean;
}

export interface PaymentFieldsProps {
  defaultValue?: Partial<Pick<PaymentValue, "name" | "number" | "expiry" | "cvc">>;
  onChange?: (value: PaymentValue) => void;
  /** Hide the cardholder field, for checkouts that collect it elsewhere. */
  hideName?: boolean;
  /** "Today", for checking the expiry. Pass it in to keep tests and previews stable. */
  now?: Date;
  label?: ReactNode;
  className?: string;
}

const BRAND_LABEL: Record<CardBrand, string> = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", discover: "Discover", unknown: "Card" };

/** The network, from the number's leading digits. */
export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^6(011|5)/.test(digits)) return "discover";
  return "unknown";
}

/** Groups digits for display: 4-6-5 for American Express, fours for the rest. */
export function formatCardNumber(digits: string, brand: CardBrand = detectCardBrand(digits)) {
  if (brand === "amex") return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  return digits.slice(0, 19).replace(/(.{4})(?=.)/g, "$1 ");
}

/** The Luhn checksum every card number carries, which catches a mistyped digit. */
export function passesLuhn(digits: string) {
  if (digits.length < 12) return false;
  let sum = 0;
  [...digits].reverse().forEach((character, index) => {
    const digit = Number(character);
    const doubled = digit * 2;
    sum += index % 2 === 1 ? (doubled > 9 ? doubled - 9 : doubled) : digit;
  });
  return sum % 10 === 0;
}

/** "MM/YY" from typed digits, adding the slash and a leading zero for 2–9. */
export function formatExpiry(input: string) {
  // Browser autofill and pasted values often carry the full year.
  const full = /^(\d{1,2})\s*\/\s*20(\d{2})$/.exec(input.trim());
  if (full) return `${full[1]!.padStart(2, "0")}/${full[2]}`;
  let digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`;
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Whether "MM/YY" is a real month that hasn't ended yet. A card works through its expiry month. */
export function isExpiryValid(expiry: string, now: Date = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(match[2]);
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

const expectedLength = (brand: CardBrand) => (brand === "amex" ? 15 : 16);
const cvcLength = (brand: CardBrand) => (brand === "amex" ? 4 : 3);

export function PaymentFields({ defaultValue, onChange, hideName = false, now, label = "Card details", className }: PaymentFieldsProps) {
  const [name, setName] = useState(defaultValue?.name ?? "");
  const [number, setNumber] = useState((defaultValue?.number ?? "").replace(/\D/g, ""));
  const [expiry, setExpiry] = useState(defaultValue?.expiry ?? "");
  const [cvc, setCvc] = useState(defaultValue?.cvc ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const brand = detectCardBrand(number);
  const numberValid = number.length === expectedLength(brand) && passesLuhn(number);
  const expiryValid = isExpiryValid(expiry, now);
  const cvcValid = cvc.length === cvcLength(brand);
  const nameValid = hideName || name.trim().length > 1;

  const numberError = touched.number && number && !numberValid ? "Check the card number." : null;
  const expiryError = touched.expiry && expiry && !expiryValid ? "Enter a valid expiry date." : null;
  const cvcError = touched.cvc && cvc && !cvcValid ? `Enter the ${cvcLength(brand)}-digit security code.` : null;
  const errors = [numberError, expiryError, cvcError].filter((message): message is string => Boolean(message));

  const emit = (next: Partial<Pick<PaymentValue, "name" | "number" | "expiry" | "cvc">>) => {
    const value = { name, number, expiry, cvc, ...next };
    const nextBrand = detectCardBrand(value.number);
    onChange?.({
      ...value,
      brand: nextBrand,
      isValid:
        (hideName || value.name.trim().length > 1) &&
        value.number.length === expectedLength(nextBrand) &&
        passesLuhn(value.number) &&
        isExpiryValid(value.expiry, now) &&
        value.cvc.length === cvcLength(nextBrand),
    });
  };

  const touch = (field: string) => setTouched((current) => ({ ...current, [field]: true }));

  return (
    <fieldset className={cx("flex w-full max-w-md min-w-0 flex-col gap-1.5", className)}>
      <legend className="pb-1.5 text-body-md-strong text-fg">{label}</legend>

      <JoinedFields split>
        {!hideName && (
          <JoinedField
            label="Name on card"
            name="cc-name"
            autoComplete="cc-name"
            value={name}
            onChange={(value) => {
              setName(value);
              emit({ name: value });
            }}
            onBlur={() => touch("name")}
          />
        )}
        <JoinedField
          label={`Card number${brand === "unknown" ? "" : ` · ${BRAND_LABEL[brand]}`}`}
          name="cc-number"
          autoComplete="cc-number"
          inputMode="numeric"
          value={formatCardNumber(number, brand)}
          error={numberError}
          trailing={numberValid ? <RiCheckLine aria-hidden className="size-5 text-status-success-text" /> : <RiBankCardLine aria-hidden className="size-5" />}
          onChange={(value) => {
            const digits = value.replace(/\D/g, "").slice(0, expectedLength(detectCardBrand(value.replace(/\D/g, ""))));
            setNumber(digits);
            emit({ number: digits });
          }}
          onBlur={() => touch("number")}
        />
        <JoinedField
          half
          label="Expiry"
          name="cc-exp"
          autoComplete="cc-exp"
          inputMode="numeric"
          placeholder="MM/YY"
          value={expiry}
          error={expiryError}
          onChange={(value) => {
            // Deleting the slash shouldn't put it straight back.
            const next = value.length < expiry.length ? value.replace(/\/$/, "") : formatExpiry(value);
            setExpiry(next);
            emit({ expiry: next });
          }}
          onBlur={() => touch("expiry")}
        />
        <JoinedField
          half
          label="Security code"
          name="cc-csc"
          autoComplete="cc-csc"
          inputMode="numeric"
          value={cvc}
          error={cvcError}
          maxLength={cvcLength(brand)}
          onChange={(value) => {
            const digits = value.replace(/\D/g, "").slice(0, cvcLength(brand));
            setCvc(digits);
            emit({ cvc: digits });
          }}
          onBlur={() => touch("cvc")}
        />
      </JoinedFields>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {errors.map((message) => (
            <li key={message} className="text-caption-strong text-fg-danger">
              {message}
            </li>
          ))}
        </ul>
      )}
      <span className="sr-only" aria-live="polite">
        {numberValid && expiryValid && cvcValid && nameValid ? "Card details complete." : ""}
      </span>
    </fieldset>
  );
}
