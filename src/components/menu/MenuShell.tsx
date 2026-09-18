"use client";

import { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore } from "react";
import { MenuLoader } from "./MenuLoader";

/**
 * The state the two menu pages share with the layout around them.
 *
 * Lives in the /menu layout, so it survives the navigation between /menu and
 * /menu/bar — which is the whole point. The loader shows once per session, and
 * every page that mounts under it needs to know whether it may play its
 * entrance yet (not while the loader is still up) and whether it is the first
 * thing the reader sees (only then does the masthead animate in).
 */
type Shell = {
  /** The loader has begun to lift, or never showed. Page entrances wait on this. */
  revealed: boolean;
  /** The session's first menu view — the masthead plays its entrance too. */
  firstVisit: boolean;
};

const ShellContext = createContext<Shell>({ revealed: false, firstVisit: false });

export function useMenuShell() {
  return useContext(ShellContext);
}

export const SEEN_KEY = "zoi-menu-seen";

/**
 * Whether this session has already seen the loader.
 *
 * Read through useSyncExternalStore because the server cannot know: it renders
 * "pending" — the loader is in the HTML, so the first paint is the loader and
 * not a flash of half-styled menu — and the client re-renders with the real
 * answer straight after hydration, with no markup mismatch. The answer is
 * fixed on the first read of each mount: the loader marks the session as seen
 * when it mounts, and that must not flip this mount's own decision.
 */
type Visit = "pending" | "first" | "seen";
const subscribeNever = () => () => {};
const serverSnapshot = (): Visit => "pending";

/**
 * pending  — server render and the hydration frame; the loader is in the HTML
 * loading  — the loader is gating on fonts and images
 * lifting  — everything is in and the loader is wiping away; the page may
 *            start its entrance underneath it
 * done     — the loader is unmounted
 */
type Phase = "pending" | "loading" | "lifting" | "done";

export function MenuShell({ children }: { children: React.ReactNode }) {
  const decision = useRef<Visit | null>(null);
  const visit = useSyncExternalStore(
    subscribeNever,
    () => {
      if (decision.current === null) {
        let seen = false;
        try {
          seen = sessionStorage.getItem(SEEN_KEY) === "1";
        } catch {
          /* storage blocked — treat as a first visit; the loader has a ceiling */
        }
        decision.current = seen ? "seen" : "first";
      }
      return decision.current;
    },
    serverSnapshot
  );

  const [lift, setLift] = useState<"idle" | "lifting" | "done">("idle");
  const onLift = useCallback(() => setLift("lifting"), []);
  const onDone = useCallback(() => setLift("done"), []);

  const phase: Phase =
    visit === "pending" ? "pending" : visit === "seen" ? "done" : lift === "idle" ? "loading" : lift;

  return (
    <ShellContext.Provider value={{ revealed: phase === "lifting" || phase === "done", firstVisit: visit === "first" }}>
      {children}
      {phase !== "done" && <MenuLoader active={phase === "loading"} onLift={onLift} onDone={onDone} />}
    </ShellContext.Provider>
  );
}
