"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../components/button/button";
import { Input } from "../../components/input/input";
import { SegmentedControl, SegmentedControlItem } from "../../components/segmented-control/segmented-control";
import { SocialButton } from "../../components/social-button/social-button";
import type { SocialBrand } from "../../components/social-button/social-button";
import { cx } from "../../utils/cx";

/**
 * Glass sign in: signing in and joining on one pane, a switch apart. It holds
 * the form and nothing else, so it can stand on a page or sit in a Modal. Other
 * providers line up along the foot.
 *
 * The form reports what was typed and leaves checking to the app: nothing here
 * talks to a server.
 */

export type SignInMode = "sign-in" | "join";

export interface SignInDetails {
  mode: SignInMode;
  email: string;
  password: string;
}

export interface GlassSignInProps {
  title?: ReactNode;
  defaultMode?: SignInMode;
  onSubmit?: (details: SignInDetails) => void;
  /** Other ways in, as icon-only buttons. */
  providers?: SocialBrand[];
  onProvider?: (provider: SocialBrand) => void;
  className?: string;
}

export function GlassSignIn({ title, defaultMode = "sign-in", onSubmit, providers = [], onProvider, className }: GlassSignInProps) {
  const [mode, setMode] = useState<SignInMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.({ mode, email, password });
  };

  return (
    <form onSubmit={submit} className={cx("glass-panel glass-slab flex w-full max-w-sm flex-col gap-4 rounded-panel border p-6", className)}>
      {title && <h2 className="text-title-md-strong text-fg">{title}</h2>}
      <SegmentedControl
        aria-label="Sign in or join"
        selectedKeys={[mode]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next !== undefined) setMode(String(next) as SignInMode);
        }}
        className="self-center"
      >
        <SegmentedControlItem id="sign-in">Sign in</SegmentedControlItem>
        <SegmentedControlItem id="join">Join</SegmentedControlItem>
      </SegmentedControl>
      <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={setEmail} />
      <Input label="Password" type="password" autoComplete={mode === "join" ? "new-password" : "current-password"} value={password} onChange={setPassword} />
      <Button type="submit" className="w-full">
        {mode === "join" ? "Create account" : "Continue"}
      </Button>
      {providers.length > 0 && (
        <div className="flex justify-center gap-2">
          {providers.map((provider) => (
            <SocialButton key={provider} type="button" brand={provider} iconOnly appearance="white" onClick={() => onProvider?.(provider)} />
          ))}
        </div>
      )}
    </form>
  );
}
