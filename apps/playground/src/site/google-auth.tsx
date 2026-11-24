import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RiLogoutBoxRLine, RiShieldUserLine } from "@remixicon/react";
import { Button as AriaButton } from "react-aria-components";
import { Avatar, Button, Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SocialButton, Text, cx, focusRingNative, toast } from "@windesign-ds/react";
import type { SocialBrand } from "@windesign-ds/react";

/**
 * Google sign-in for the playground, on Google Identity Services.
 *
 * The site is static, so this is the browser half of OAuth only: a Google popup
 * grants a short-lived access token, which fetches the person's name, email and
 * photo. Nothing is sent to a server of ours and no token is stored; only the
 * profile is kept, for this tab (sessionStorage), so the demos remember who
 * signed in. A real product would send Google's credential to its own server
 * and verify it there before trusting it.
 *
 * The OAuth client ID comes from VITE_GOOGLE_CLIENT_ID at build time. Client IDs
 * aren't secret (they ship in every Google sign-in page), but each one only
 * works from the origins listed for it in Google Cloud.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const STORAGE_KEY = "ds-google-profile";
const SCOPES = "openid email profile";

export interface GoogleProfile {
  name: string;
  email: string;
  picture?: string;
}

type TokenResponse = { access_token?: string; error?: string; error_description?: string };
type TokenClient = { requestAccessToken: (overrides?: { prompt?: string }) => void };
type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: { type: string; message?: string }) => void;
    }) => TokenClient;
    revoke: (token: string, done?: () => void) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

type Status = "unconfigured" | "loading" | "ready" | "signing-in" | "error";

interface GoogleAuthValue {
  /** False until a client ID is set: the buttons explain instead of opening a popup. */
  configured: boolean;
  status: Status;
  user: GoogleProfile | null;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthValue | null>(null);

function readProfile(): GoogleProfile | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoogleProfile) : null;
  } catch {
    return null;
  }
}

function writeProfile(profile: GoogleProfile | null) {
  try {
    if (profile) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private windows); the session just won't survive a reload.
  }
}

/** Loads Google's script once, however many providers mount. */
let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load Google sign-in"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const configured = Boolean(CLIENT_ID);
  const [status, setStatus] = useState<Status>(configured ? "loading" : "unconfigured");
  const [user, setUser] = useState<GoogleProfile | null>(readProfile);
  const [error, setError] = useState<string | null>(null);
  const client = useRef<TokenClient | null>(null);
  const token = useRef<string | null>(null);

  // Load the script up front: the popup has to open inside the click that asked for it,
  // so the token client must already exist by then.
  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.google) return;
        client.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (response) => {
            if (response.error || !response.access_token) {
              setStatus("error");
              setError(response.error_description ?? "Google didn't sign you in.");
              return;
            }
            token.current = response.access_token;
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              if (!res.ok) throw new Error(String(res.status));
              const info = (await res.json()) as { name?: string; email?: string; picture?: string };
              const profile = { name: info.name ?? info.email ?? "Google user", email: info.email ?? "", picture: info.picture };
              setUser(profile);
              writeProfile(profile);
              setStatus("ready");
              setError(null);
              toast.success(`Signed in as ${profile.name}`);
            } catch {
              setStatus("error");
              setError("Signed in, but your Google profile couldn't be read.");
            }
          },
          error_callback: (e) => {
            // Closing the popup isn't a failure worth shouting about.
            setStatus("ready");
            if (e.type !== "popup_closed") setError(e.type === "popup_failed_to_open" ? "Your browser blocked the Google popup." : "Google sign-in failed.");
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setError("Couldn't reach Google. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(() => {
    if (!CLIENT_ID) {
      toast.show("Google sign-in isn't set up on this site yet.");
      return;
    }
    if (!client.current) {
      toast.show("Google sign-in is still loading. Try again in a moment.");
      return;
    }
    setError(null);
    setStatus("signing-in");
    client.current.requestAccessToken({ prompt: user ? "" : "select_account" });
  }, [user]);

  const signOut = useCallback(() => {
    const current = token.current;
    token.current = null;
    if (current) window.google?.accounts.oauth2.revoke(current);
    setUser(null);
    writeProfile(null);
    setStatus(CLIENT_ID ? "ready" : "unconfigured");
    toast.show("Signed out");
  }, []);

  const value = useMemo(() => ({ configured, status, user, error, signIn, signOut }), [configured, status, user, error, signIn, signOut]);
  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>;
}

export function useGoogleAuth(): GoogleAuthValue {
  const value = useContext(GoogleAuthContext);
  if (!value) throw new Error("useGoogleAuth must be used inside GoogleAuthProvider");
  return value;
}

/**
 * For a block's `onProvider`: Google signs in for real; the other providers
 * aren't wired to anything in the playground, so they say so.
 */
export function useProviderHandler() {
  const { signIn } = useGoogleAuth();
  return useCallback(
    (provider: SocialBrand) => {
      if (provider === "google") signIn();
      else toast.show(`${provider[0]!.toUpperCase()}${provider.slice(1)} sign-in isn't connected in the playground; Google is.`);
    },
    [signIn],
  );
}

/** Who's signed in, with a way out; or why Google sign-in can't run here. Sits under the auth demos. */
export function GoogleSession({ className }: { className?: string }) {
  const { configured, status, user, error, signOut } = useGoogleAuth();
  if (user)
    return (
      <div role="status" className={cx("flex w-full max-w-sm items-center gap-3 rounded-surface border border-line bg-surface p-3", className)}>
        <Avatar src={user.picture} alt="" initials={user.name.slice(0, 1).toUpperCase()} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-md-strong text-fg">{user.name}</span>
          <span className="truncate text-body-sm text-fg-secondary">{user.email}</span>
        </div>
        <Button variant="secondary" size="sm" leadingIcon={RiLogoutBoxRLine} onPress={signOut}>
          Sign out
        </Button>
      </div>
    );
  return (
    <div role="status" className={cx("flex w-full max-w-sm items-start gap-2", className)}>
      <RiShieldUserLine aria-hidden className="mt-0.5 size-4 shrink-0 text-icon-secondary" />
      <Text size="sm" tone={error ? "danger" : "secondary"}>
        {!configured
          ? "Google sign-in isn't set up on this site yet: it needs a Google OAuth client ID."
          : error
            ? error
            : status === "signing-in"
              ? "Finish signing in in the Google window…"
              : "The Google button signs you in for real. Nothing is sent anywhere but Google."}
      </Text>
    </div>
  );
}

/**
 * The site header's account control. Signed out, a small Google button; signed
 * in, your avatar, opening a menu with who you are and Sign out. Without a
 * client ID it renders nothing, so a fork without one shows no dead button.
 */
export function HeaderAccount({ className }: { className?: string }) {
  const { configured, status, user, signIn, signOut } = useGoogleAuth();
  if (!configured) return null;
  if (!user) {
    const busy = status === "signing-in" || status === "loading";
    return (
      <span className={cx("flex", className)}>
        {/* The header is full on most screens: the Google mark alone, with the words from 2xl. */}
        <SocialButton brand="google" size="small" appearance="white" iconOnly aria-label="Sign in with Google" onClick={signIn} disabled={busy} className="2xl:hidden" />
        <SocialButton
          brand="google"
          size="small"
          appearance="white"
          onClick={signIn}
          disabled={busy}
          // Sign-in forms give it a fixed width; in the header it fits its label.
          className="hidden w-auto 2xl:inline-flex"
        >
          Sign in
        </SocialButton>
      </span>
    );
  }
  return (
    <MenuTrigger>
      <AriaButton aria-label={`Account: ${user.name}`} className={cx("flex cursor-pointer rounded-full", focusRingNative, className)}>
        <Avatar src={user.picture} alt="" initials={user.name.slice(0, 1).toUpperCase()} size="sm" />
      </AriaButton>
      <Menu aria-label="Account" placement="bottom end" onAction={(key) => key === "sign-out" && signOut()}>
        {/* Not disabled: a disabled item is drawn faint, and who you are should read clearly. */}
        <MenuSection title="Signed in as">
          <MenuItem id="profile" textValue={user.name} description={user.email}>
            {user.name}
          </MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuItem id="sign-out" icon={RiLogoutBoxRLine}>
          Sign out
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

/** The Social Button page's demo: one working Google button and the session under it. */
export function GoogleSignInDemo() {
  const { signIn, status } = useGoogleAuth();
  return (
    <div className="flex w-72 flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <SocialButton brand="google" fullWidth onClick={signIn} disabled={status === "signing-in"}>
          Continue with Google
        </SocialButton>
        <SocialButton brand="github" fullWidth onClick={() => toast.show("GitHub sign-in isn't connected in the playground; Google is.")}>
          Continue with GitHub
        </SocialButton>
      </div>
      <GoogleSession />
    </div>
  );
}
