"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiArrowLeftLine, RiCheckLine } from "@remixicon/react";
import { Button } from "../../components/button/button";
import { LinkButton } from "../../components/buttons/link-button";
import { Divider } from "../../components/divider/divider";
import { InputOtp } from "../../components/input-otp/input-otp";
import { SocialButton, type SocialBrand } from "../../components/social-button/social-button";
import { easing } from "../../motion/tokens";
import { focusRing } from "../../recipes/focus-ring";
import { cx } from "../../utils/cx";
import { JoinedField, JoinedFields } from "./joined-field";

/**
 * Auth flow, after Moon's auth template: a whole sign-in journey in one card.
 * Sign in, create an account, reset a password, and confirm a one-time code,
 * moving between them without leaving the card. Fields sit joined in one
 * rounded group, with sign-in providers under the form.
 *
 * Every step calls a handler you supply, and the handler decides what happens
 * next: return nothing or `true` to continue, `false` for a generic failure,
 * or a string to show as the error. Handlers may be async; the button shows
 * progress meanwhile. The block holds no credentials of its own and talks to
 * no service.
 *
 * Focus moves to each step's heading, so a screen reader announces the change
 * and keyboard users carry on from the top of the new step.
 */

export type AuthStep = "signin" | "signup" | "forgot" | "sent" | "verify" | "done";

export interface AuthCredentials {
  email: string;
  password: string;
  /** Sign-up only. */
  name?: string;
}

/** What a handler returns: nothing or `true` to continue, `false` or a message to stop. */
export type AuthOutcome = void | boolean | string;

export interface AuthFlowProps {
  defaultStep?: "signin" | "signup";
  /** Sign-in providers, shown under the form. Pass `[]` to hide them. */
  providers?: SocialBrand[];
  onProvider?: (provider: SocialBrand) => void;
  onSignIn?: (credentials: AuthCredentials) => AuthOutcome | Promise<AuthOutcome>;
  onSignUp?: (credentials: AuthCredentials) => AuthOutcome | Promise<AuthOutcome>;
  onForgot?: (email: string) => AuthOutcome | Promise<AuthOutcome>;
  onVerify?: (code: string) => AuthOutcome | Promise<AuthOutcome>;
  onResend?: () => void;
  /** Called once the person is through. */
  onComplete?: () => void;
  /** Ask for a one-time code after the password. Default true. */
  requireCode?: boolean;
  codeLength?: number;
  /** Seconds before a new code can be requested. Default 30. */
  resendSeconds?: number;
  className?: string;
}

const COPY: Record<AuthStep, { title: string; body?: string }> = {
  signin: { title: "Sign in" },
  signup: { title: "Create account" },
  forgot: { title: "Reset your password", body: "We'll email you a link to set a new one." },
  sent: { title: "Check your inbox" },
  verify: { title: "Enter your code" },
  done: { title: "You're in", body: "Signed in successfully." },
};

export function AuthFlow({
  defaultStep = "signin",
  providers = ["google", "apple"],
  onProvider,
  onSignIn,
  onSignUp,
  onForgot,
  onVerify,
  onResend,
  onComplete,
  requireCode = true,
  codeLength = 6,
  resendSeconds = 30,
  className,
}: AuthFlowProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const moved = useRef(false);
  const [step, setStep] = useState<AuthStep>(defaultStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  const go = (next: AuthStep) => {
    moved.current = true;
    setError(null);
    setStep(next);
    if (next === "verify") setWait(resendSeconds);
    if (next === "done") onComplete?.();
  };

  // Announce each new step, but leave focus alone on first render. This has to
  // hang off the heading mounting, not off `step` changing: the old step is
  // still animating out at that point, and focus would go down with it.
  const arrive = useCallback((node: HTMLHeadingElement | null) => {
    if (node && moved.current) node.focus();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  /** Runs a handler, then either moves on or shows why it couldn't. */
  const attempt = async (action: (() => AuthOutcome | Promise<AuthOutcome>) | undefined, next: AuthStep, failure: string) => {
    setBusy(true);
    setError(null);
    try {
      const outcome = await action?.();
      if (outcome === false || typeof outcome === "string") {
        setError(typeof outcome === "string" ? outcome : failure);
        return false;
      }
      go(next);
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const afterPassword: AuthStep = requireCode ? "verify" : "done";

  const submit = (event: FormEvent<HTMLFormElement>, run: () => void) => {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) run();
    else setError("Check the highlighted fields.");
  };

  const verify = async (value: string) => {
    const ok = await attempt(() => onVerify?.(value), "done", "That code didn't work. Check it and try again.");
    if (!ok) setCode("");
  };

  const emailField = <JoinedField label="Email" type="email" name="email" autoComplete="email" isRequired value={email} onChange={setEmail} />;

  const passwordField = (signup: boolean) => (
    <JoinedField
      label="Password"
      type={showPassword ? "text" : "password"}
      name="password"
      autoComplete={signup ? "new-password" : "current-password"}
      isRequired
      minLength={signup ? 8 : undefined}
      value={password}
      onChange={setPassword}
      action={
        <AriaButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onPress={() => setShowPassword((value) => !value)}
          className={cx("cursor-pointer rounded-control-xs text-body-sm-strong text-fg underline underline-offset-2", focusRing)}
        >
          {showPassword ? "Hide" : "Show"}
        </AriaButton>
      }
    />
  );

  let body: ReactNode;
  if (step === "signin" || step === "signup") {
    const signup = step === "signup";
    body = (
      <>
        <form
          noValidate
          className="flex flex-col gap-3"
          onSubmit={(event) =>
            submit(event, () =>
              signup
                ? void attempt(() => onSignUp?.({ email, password, name }), afterPassword, "We couldn't create that account.")
                : void attempt(() => onSignIn?.({ email, password }), afterPassword, "That email and password don't match."),
            )
          }
        >
          {signup ? (
            <>
              <JoinedFields>
                <JoinedField label="Name" name="name" autoComplete="name" isRequired value={name} onChange={setName} />
                {emailField}
              </JoinedFields>
              <JoinedFields>{passwordField(true)}</JoinedFields>
              <p className="text-caption text-fg-secondary">At least 8 characters.</p>
            </>
          ) : (
            <>
              <JoinedFields>
                {emailField}
                {passwordField(false)}
              </JoinedFields>
              <LinkButton type="button" size="small" onClick={() => go("forgot")} className="self-start text-fg">
                Forgot password?
              </LinkButton>
            </>
          )}
          <Button type="submit" isPending={busy} className="mt-1 h-14 w-full rounded-overlay">
            {signup ? "Create account" : "Sign in"}
          </Button>
        </form>
        {providers.length > 0 && (
          <>
            <Divider>or</Divider>
            <div className="flex flex-col gap-2">
              {providers.map((provider) => (
                <SocialButton key={provider} brand={provider} appearance="white" fullWidth onClick={() => onProvider?.(provider)} />
              ))}
            </div>
          </>
        )}
      </>
    );
  } else if (step === "forgot") {
    body = (
      <form noValidate className="flex flex-col gap-3" onSubmit={(event) => submit(event, () => void attempt(() => onForgot?.(email), "sent", "We couldn't send that email."))}>
        <JoinedFields>{emailField}</JoinedFields>
        <Button type="submit" isPending={busy} className="mt-1 h-14 w-full rounded-overlay">
          Send reset link
        </Button>
        <Button variant="tertiary" leadingIcon={RiArrowLeftLine} onPress={() => go("signin")} className="w-full">
          Back to sign in
        </Button>
      </form>
    );
  } else if (step === "sent") {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-body-md text-fg-secondary">
          If an account exists for <span className="text-fg">{email}</span>, a reset link is on its way.
        </p>
        <Button variant="secondary" onPress={() => go("signin")} className="w-full">
          Back to sign in
        </Button>
      </div>
    );
  } else if (step === "verify") {
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-body-md text-fg-secondary">
          We sent a {codeLength}-digit code to <span className="text-fg">{email || "your device"}</span>.
        </p>
        <InputOtp
          length={codeLength}
          value={code}
          onChange={(value) => {
            setCode(value);
            setError(null);
          }}
          onComplete={(value) => void verify(value)}
          isInvalid={error !== null}
          isDisabled={busy}
          autoFocus={moved.current}
          aria-label="One-time code"
        />
        <div className="flex items-center justify-between gap-3">
          <LinkButton type="button" size="small" variant="secondary" onClick={() => go("signin")}>
            Use a different account
          </LinkButton>
          <LinkButton
            type="button"
            size="small"
            disabled={wait > 0}
            onClick={() => {
              setWait(resendSeconds);
              onResend?.();
            }}
          >
            {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
          </LinkButton>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex justify-center py-2">
        <span className="flex size-12 items-center justify-center rounded-full bg-action-tertiary text-action-tertiary-fg">
          <RiCheckLine aria-hidden className="size-6" />
        </span>
      </div>
    );
  }

  const copy = COPY[step];
  return (
    <section aria-label="Sign in" className={cx("w-full max-w-sm overflow-hidden rounded-panel bg-surface p-4 sm:p-6", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: easing.enter }}
          className="flex flex-col gap-4"
        >
          <header className="flex flex-col gap-1">
            <h2 ref={step === "verify" ? undefined : arrive} tabIndex={-1} className="text-title-lg-strong text-fg outline-none">
              {copy.title}
            </h2>
            {copy.body && <p className="text-body-md text-fg-secondary">{copy.body}</p>}
            {(step === "signin" || step === "signup") && (
              <p className="text-body-md text-fg">
                {step === "signin" ? "Don't have an account? " : "Already have an account? "}
                <LinkButton type="button" size="small" onClick={() => go(step === "signin" ? "signup" : "signin")} className="text-fg underline underline-offset-2">
                  {step === "signin" ? "Create account" : "Log in"}
                </LinkButton>
              </p>
            )}
          </header>
          {error && (
            <p role="alert" className="rounded-item bg-danger-subtle px-3 py-2 text-body-sm text-status-danger-text">
              {error}
            </p>
          )}
          {body}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
