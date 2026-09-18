"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HERO_STILLS } from "@/lib/assets";

/** Hard ceiling — the loader must never trap the user if an asset silently hangs. */
const SAFETY_TIMEOUT_MS = 6_000;

/**
 * Floor. On a warm cache everything resolves in well under 200ms, and a loader
 * that flashes and vanishes reads as a glitch rather than as an intro.
 */
const MIN_DISPLAY_MS = 1_200;

/**
 * The video counts for this share of the progress bar. It is the single biggest
 * asset, so letting it drive most of the count keeps the number honest rather than
 * having it sit at 90% waiting.
 */
const VIDEO_WEIGHT = 0.55;

type PreloadValue = {
  /** 0..1, derived from real completions. */
  progress: number;
  /** Assets are in. The loader may begin its exit. */
  ready: boolean;
  /** The loader has finished wiping away — the hero intro starts on this. */
  revealed: boolean;
  markRevealed: () => void;
  /** Hero passes each of its <img> elements here so we await the REAL request. */
  registerStill: (index: number, el: HTMLImageElement | null) => void;
  /** Hero passes its <video> here so the loader can gate on it buffering. */
  registerVideo: (el: HTMLVideoElement | null) => void;
};

const PreloadContext = createContext<PreloadValue>({
  progress: 0,
  ready: false,
  revealed: false,
  markRevealed: () => {},
  registerStill: () => {},
  registerVideo: () => {},
});

export function usePreload() {
  return useContext(PreloadContext);
}

/** Resolves when the element has fired load or error, whichever comes first. */
function awaitLoadEvent(el: HTMLImageElement): Promise<void> {
  if (el.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      el.removeEventListener("load", done);
      el.removeEventListener("error", done);
      resolve();
    };
    el.addEventListener("load", done);
    el.addEventListener("error", done);
  });
}

/**
 * Resolves once the image is DECODED, not merely downloaded.
 *
 * This matters: the hero cuts between eight stills every 500ms, and an image that
 * has landed but not been decoded will hitch on its first paint. decode() moves
 * that cost into the loader where nobody sees it.
 *
 * decode() rejects if called before a src is attached or if the fetch failed, so a
 * rejection falls back to the load event and one retry. A permanently broken image
 * still counts toward progress rather than hanging the gate.
 */
export async function awaitImageDecoded(el: HTMLImageElement): Promise<void> {
  try {
    await el.decode();
    return;
  } catch {
    /* not decodable yet — wait for the load event and try once more */
  }
  await awaitLoadEvent(el);
  try {
    await el.decode();
  } catch {
    /* genuinely broken; count it and move on */
  }
}

/**
 * Resolves once the video has its first frames decoded — `loadeddata`, i.e.
 * readyState >= HAVE_CURRENT_DATA. Deliberately NOT canplaythrough: the loop only
 * needs to start, not to be fully buffered, and waiting for the whole buffer adds
 * seconds for no visible benefit.
 *
 * Errors resolve too — a missing or undecodable file must not hang the loader; the
 * hero falls back to its poster in that case.
 */
function awaitVideo(el: HTMLVideoElement): Promise<void> {
  if (el.readyState >= 2) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      el.removeEventListener("loadeddata", done);
      el.removeEventListener("error", done);
      resolve();
    };
    el.addEventListener("loadeddata", done);
    el.addEventListener("error", done);
    el.load();
  });
}

/** A deferred that some other component resolves once it has mounted. */
function makeGate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

export function PreloadProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const markRevealed = useCallback(() => setRevealed(true), []);

  const stillEls = useRef<(HTMLImageElement | null)[]>(
    new Array(HERO_STILLS.length).fill(null)
  );
  const videoEl = useRef<HTMLVideoElement | null>(null);

  // Lazy useState, not a ref: these are created exactly once and never read during
  // render, which keeps the refs-in-render rule satisfied.
  const [stillsGate] = useState(makeGate);
  const [videoGate] = useState(makeGate);

  const registerStill = useCallback(
    (index: number, el: HTMLImageElement | null) => {
      stillEls.current[index] = el;
      if (stillEls.current.every((e) => e !== null)) stillsGate.resolve();
    },
    [stillsGate]
  );

  const registerVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      videoEl.current = el;
      if (el) videoGate.resolve();
    },
    [videoGate]
  );

  useEffect(() => {
    let cancelled = false;

    // Stills share what the video does not take.
    const stillWeight = (1 - VIDEO_WEIGHT) / HERO_STILLS.length;
    let stillsDone = 0;
    /** 0..1 of the video's own share, from its buffered ranges. */
    let videoFraction = 0;

    const publish = () => {
      if (cancelled) return;
      const value = stillsDone * stillWeight + videoFraction * VIDEO_WEIGHT;
      setProgress(Math.min(1, value));
    };

    /**
     * Await the hero's ACTUAL <img> elements rather than creating parallel Image()
     * objects. Those elements point at optimized /_next/image URLs; hitting the raw
     * files instead would download megabytes of originals that never get displayed.
     */
    async function loadStills() {
      await stillsGate.promise;
      await Promise.all(
        stillEls.current.map(async (el) => {
          if (el) await awaitImageDecoded(el);
          stillsDone += 1;
          publish();
        })
      );
    }

    async function loadVideo() {
      await videoGate.promise;
      const el = videoEl.current;
      if (!el) {
        videoFraction = 1;
        publish();
        return;
      }

      /*
        Credit the video incrementally from its buffered ranges. Without this the
        video's whole 55% lands as one jump the moment `loadeddata` fires, which
        makes the bar sit still and then leap — and skips a status phrase outright.
      */
      const onProgress = () => {
        if (el.buffered.length > 0 && el.duration > 0) {
          const buffered = el.buffered.end(el.buffered.length - 1);
          videoFraction = Math.max(videoFraction, Math.min(1, buffered / el.duration));
          publish();
        }
      };
      el.addEventListener("progress", onProgress);
      el.addEventListener("loadedmetadata", onProgress);

      await awaitVideo(el);

      el.removeEventListener("progress", onProgress);
      el.removeEventListener("loadedmetadata", onProgress);
      videoFraction = 1;
      publish();
    }

    const startedAt = Date.now();

    const safety = setTimeout(() => {
      if (cancelled) return;
      setProgress(1);
      setReady(true);
    }, SAFETY_TIMEOUT_MS);

    Promise.all([loadStills(), loadVideo()]).then(async () => {
      if (cancelled) return;
      setProgress(1);

      // Hold the floor. On a warm cache this is the only thing keeping the loader
      // on screen long enough to read as intentional.
      const remaining = MIN_DISPLAY_MS - (Date.now() - startedAt);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      if (cancelled) return;
      clearTimeout(safety);
      setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [stillsGate, videoGate]);

  return (
    <PreloadContext.Provider
      value={{ progress, ready, revealed, markRevealed, registerStill, registerVideo }}
    >
      {children}
    </PreloadContext.Provider>
  );
}
