"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("load", onChange, { once: true });
  return () => window.removeEventListener("load", onChange);
}

function getSnapshot() {
  return document.readyState === "complete";
}

function getServerSnapshot() {
  return false;
}

/**
 * Whether the window's `load` event has fired — false on the server and until
 * it does. The document's ready state is an external store, so this reads it
 * with useSyncExternalStore rather than mirroring it into state from an effect.
 *
 * Used to hold work that must not compete with the first paint: images that
 * nothing shows until later, a route prefetch, a large media request.
 */
export function useWindowLoaded(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
