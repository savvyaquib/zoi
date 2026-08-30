"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * useSyncExternalStore is the right primitive: matchMedia IS an external store, so
 * this stays correct through hydration without a setState-in-effect cascade.
 *
 * `serverValue` is what the server and first hydration render assume. For the hero
 * video source that must be `false` (mobile), so a phone never briefly commits to
 * the 9 MB desktop encode.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}
