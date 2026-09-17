"use client";

import { useEffect } from "react";

/**
 * Tells the shared chrome what ground the current page sits on.
 *
 * The nav and footer live in the root layout and cannot see which route is
 * rendering. A page on a light surface mounts this, and for as long as it is
 * mounted <html> carries data-surface="paper" — which is all globals.css needs
 * to recolour the cream wordmark. Removed on unmount, so navigating back to
 * the home page restores the dark-ground chrome without a reload.
 */
export function SurfaceFlag({ surface }: { surface: "paper" }) {
  useEffect(() => {
    document.documentElement.dataset.surface = surface;
    return () => {
      delete document.documentElement.dataset.surface;
    };
  }, [surface]);
  return null;
}
