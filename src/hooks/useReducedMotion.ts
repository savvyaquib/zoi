"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server and first hydration render assume motion is allowed. */
function getServerSnapshot() {
  return false;
}

/**
 * Tracks `prefers-reduced-motion`.
 *
 * useSyncExternalStore is the right primitive here: matchMedia IS an external
 * store, so this stays correct through hydration without a setState-in-effect
 * cascade on every mount.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
