"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button as AriaButton, Input, ListBox, ListBoxItem, Popover, Select, SelectValue, TextField } from "react-aria-components";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_DESCRIPTION, FIELD_ERROR, FIELD_INPUT, FIELD_LABEL, fieldShell } from "../../recipes/field";
import { MENU_ITEM, MENU_ITEMS_CONTAINER, MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";

/**
 * PhoneField: a phone number with its country calling code. The code sits
 * at the start of the field as a compact picker (type a country's name to
 * jump to it); the number accepts digits, spaces, dashes and brackets.
 *
 * `onChange` receives the country, the number as typed and the E.164 form
 * ("+351912345678") to store. Codes are shown as ISO letters, not flags,
 * because flag emoji don't render on Windows.
 */

export interface PhoneCountry {
  /** ISO 3166 alpha-2, e.g. "PT". */
  code: string;
  name: string;
  /** Calling code without "+", e.g. "351". */
  dial: string;
}

export const DEFAULT_PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "AR", name: "Argentina", dial: "54" },
  { code: "AU", name: "Australia", dial: "61" },
  { code: "BR", name: "Brazil", dial: "55" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "CN", name: "China", dial: "86" },
  { code: "DE", name: "Germany", dial: "49" },
  { code: "ES", name: "Spain", dial: "34" },
  { code: "FR", name: "France", dial: "33" },
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "ID", name: "Indonesia", dial: "62" },
  { code: "IN", name: "India", dial: "91" },
  { code: "IT", name: "Italy", dial: "39" },
  { code: "JP", name: "Japan", dial: "81" },
  { code: "KE", name: "Kenya", dial: "254" },
  { code: "KR", name: "South Korea", dial: "82" },
  { code: "MX", name: "Mexico", dial: "52" },
  { code: "NG", name: "Nigeria", dial: "234" },
  { code: "NL", name: "Netherlands", dial: "31" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "SE", name: "Sweden", dial: "46" },
  { code: "SG", name: "Singapore", dial: "65" },
  { code: "US", name: "United States", dial: "1" },
  { code: "ZA", name: "South Africa", dial: "27" },
];

export interface PhoneValue {
  country: string;
  /** The number as typed, without the calling code. */
  national: string;
  /** "+<dial><digits>", or "" while there are no digits. */
  e164: string;
}

/** Builds the E.164 form from a calling code and a national number. */
export function toE164(dial: string, national: string) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${dial}${digits}` : "";
}

export interface PhoneFieldProps {
  label: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Default "US". */
  defaultCountry?: string;
  defaultValue?: string;
  onChange?: (value: PhoneValue) => void;
  countries?: PhoneCountry[];
  placeholder?: string;
  name?: string;
  className?: string;
}

export function PhoneField({
  label,
  description,
  errorMessage,
  isInvalid,
  isRequired,
  isDisabled,
  defaultCountry = "US",
  defaultValue = "",
  onChange,
  countries = DEFAULT_PHONE_COUNTRIES,
  placeholder = "Phone number",
  name,
  className,
}: PhoneFieldProps) {
  const id = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const [country, setCountry] = useState(defaultCountry);
  const [national, setNational] = useState(defaultValue);
  const sorted = useMemo(() => [...countries].sort((a, b) => a.name.localeCompare(b.name)), [countries]);
  const current = countries.find((c) => c.code === country) ?? countries[0]!;

  const emit = (nextCountry: string, nextNational: string) => {
    const dial = countries.find((c) => c.code === nextCountry)?.dial ?? current.dial;
    onChange?.({ country: nextCountry, national: nextNational, e164: toE164(dial, nextNational) });
  };

  return (
    <div className={cx("flex w-full flex-col gap-1", className)}>
      <span id={`${id}-label`} className={cx(FIELD_LABEL, "self-start")}>
        {label}
        {isRequired && (
          <span aria-hidden className="text-fg-danger">
            *
          </span>
        )}
      </span>
      <div
        ref={shellRef}
        className={cx(
          fieldShell({ isDisabled, isInvalid }, "md"),
          "ps-1",
          !isDisabled && "hover:not-focus-within:ring-line-control-hover",
          !isDisabled && !isInvalid && "focus-within:ring-2 focus-within:ring-focus",
        )}
      >
        <Select
          aria-label="Country calling code"
          selectedKey={country}
          isDisabled={isDisabled}
          onSelectionChange={(key) => {
            if (key == null) return;
            setCountry(String(key));
            emit(String(key), national);
          }}
        >
          <AriaButton
            className={cx(
              "flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-control-sm px-1.5 font-mono text-body-sm text-fg",
              "transition-colors duration-(--ds-motion-duration-fast) data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-pressed",
              focusRing,
            )}
          >
            <SelectValue className="tabular-nums">
              {() => (
                <>
                  <span className="text-fg-secondary">{current.code}</span> +{current.dial}
                </>
              )}
            </SelectValue>
            <ChevronDownSmall aria-hidden className="size-3.5 text-fg-secondary" />
          </AriaButton>
          <Popover triggerRef={shellRef} placement="bottom start" offset={4} className={cx(MENU_POPOVER_SURFACE, "w-72 p-1.5")}>
            <ListBox items={sorted} className={cx(MENU_ITEMS_CONTAINER, "max-h-64 overflow-auto")}>
              {(c) => (
                <ListBoxItem
                  id={c.code}
                  textValue={c.name}
                  className={({ isFocused, isSelected }) => cx(MENU_ITEM, "py-1.5 text-body-md", (isFocused || isSelected) && "bg-surface-hover")}
                >
                  <span className="w-7 font-mono text-caption text-fg-secondary">{c.code}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono text-caption tabular-nums text-fg-secondary">+{c.dial}</span>
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </Select>
        <span aria-hidden className="h-5 w-px shrink-0 bg-line" />
        <TextField
          aria-labelledby={`${id}-label`}
          aria-describedby={description || (isInvalid && errorMessage) ? `${id}-help` : undefined}
          type="tel"
          name={name}
          autoComplete="tel-national"
          inputMode="tel"
          isRequired={isRequired}
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          value={national}
          onChange={(text) => {
            const cleaned = text.replace(/[^\d\s\-()]/g, "");
            setNational(cleaned);
            emit(country, cleaned);
          }}
          className="flex min-w-0 flex-1 self-stretch"
        >
          <Input placeholder={placeholder} className={cx(FIELD_INPUT, "tabular-nums")} />
        </TextField>
      </div>
      {isInvalid && errorMessage ? (
        <p id={`${id}-help`} className={FIELD_ERROR}>
          {errorMessage}
        </p>
      ) : (
        description && (
          <p id={`${id}-help`} className={FIELD_DESCRIPTION}>
            {description}
          </p>
        )
      )}
    </div>
  );
}
