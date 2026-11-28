import type { ComponentProps, ReactNode } from "react";
import { RiLockLine } from "@remixicon/react";
import { Button, CodeBlock as DsCodeBlock, cx } from "@windesign-ds/react";
import { useGoogleAuth } from "./google-auth";

/**
 * Commands, imports and code samples on the site are for signed-in visitors.
 * Signed out, the code is blurred and can't be focused, selected or copied,
 * and a button over it opens Google sign-in.
 *
 * This is a front-end gate only: the snippets still ship in the bundle, and
 * the packages are public on npm. Without a Google client ID nobody could sign
 * in, so the gate stays open.
 */
export function SignInGate({ children, className, compact = false }: { children: ReactNode; className?: string; compact?: boolean }) {
  const { configured, user, status, signIn } = useGoogleAuth();
  if (!configured || user) return <>{children}</>;
  const busy = status === "signing-in" || status === "loading";
  return (
    <div className={cx("relative isolate min-w-0", className)}>
      <div inert aria-hidden className="pointer-events-none blur-soft select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-2 p-2">
        <Button size="sm" variant="secondary" leadingIcon={RiLockLine} onPress={signIn} isDisabled={busy} className="whitespace-nowrap shadow-raised">
          {compact ? "Sign in to copy" : "Sign in to see the code"}
        </Button>
      </div>
    </div>
  );
}

/** The design system's CodeBlock, behind the sign-in gate. Same props. */
export function CodeBlock({ className, ...props }: ComponentProps<typeof DsCodeBlock>) {
  const { configured, user } = useGoogleAuth();
  // Open, the block keeps its own className (grid spans and widths land on it as before).
  if (!configured || user) return <DsCodeBlock className={className} {...props} />;
  return (
    <SignInGate className={className}>
      <DsCodeBlock {...props} />
    </SignInGate>
  );
}
