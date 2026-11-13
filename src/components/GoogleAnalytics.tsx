"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import {
  GA_MEASUREMENT_ID,
  pageview,
  trackWhatsAppClick,
  trackPhoneClick,
  trackMenuClick,
  trackReservationClick,
} from "@/lib/gtag";

function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // Track page views on client-side route changes
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Skip the first render: initial pageview is handled by the script tag config
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const search = searchParams?.toString();
    const url = pathname + (search ? `?${search}` : "");
    pageview(url);
  }, [pathname, searchParams]);

  // Global event delegation for clicks on whatsapp, phone, menu, reservation
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    let lastReservationEventTime = 0;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest("a, button") as HTMLElement | null;
      if (!target) return;

      const rawHref = target.getAttribute("href") || (target as HTMLAnchorElement).href || "";
      const href = rawHref.toLowerCase();
      const text = (target.textContent || "").replace(/\s+/g, " ").trim();
      const ariaLabel = target.getAttribute("aria-label") || "";
      const label = text || ariaLabel || rawHref;

      // 1. WhatsApp button / link click
      if (
        href.includes("wa.me") ||
        href.includes("whatsapp.com") ||
        href.startsWith("whatsapp:") ||
        text.toLowerCase().includes("whatsapp")
      ) {
        trackWhatsAppClick({
          button_name: text || "WhatsApp",
          event_label: label,
          link_url: rawHref,
        });
        return;
      }

      // 2. Phone button / link click
      if (href.startsWith("tel:") || href.includes("tel:")) {
        const phone = rawHref.replace(/^tel:/i, "");
        trackPhoneClick({
          phone,
          button_name: text || phone,
          event_label: label,
          link_url: rawHref,
        });
        return;
      }

      // 3. Menu button / link click (excludes hamburger toggle button)
      const isMenuLink =
        rawHref === "/menu" ||
        rawHref === "/menu/" ||
        rawHref.startsWith("/menu/") ||
        rawHref === "#menu" ||
        (text.toLowerCase() === "menu" && target.tagName.toLowerCase() === "a");

      if (isMenuLink) {
        trackMenuClick({
          button_name: text || "Menu",
          event_label: label,
          link_url: rawHref,
        });
        return;
      }

      // 4. Reservation button / link click
      const isReservation =
        href.includes("#reserve") ||
        text.toLowerCase().includes("request a table") ||
        text.toLowerCase() === "reserve" ||
        text.toLowerCase().includes("plan a celebration") ||
        (target.tagName.toLowerCase() === "button" &&
          target.getAttribute("type") === "submit" &&
          target.closest("#reserve") !== null);

      if (isReservation) {
        lastReservationEventTime = Date.now();
        trackReservationClick({
          button_name: text || "Reservation",
          event_label: label,
          link_url: rawHref || undefined,
        });
        return;
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;

      const isReservationForm =
        form.closest("#reserve") !== null ||
        form.querySelector('button[type="submit"]')?.textContent?.toLowerCase().includes("request a table");

      if (isReservationForm) {
        // Prevent duplicate trigger if user clicked the submit button in the last second
        if (Date.now() - lastReservationEventTime < 1000) return;
        lastReservationEventTime = Date.now();

        trackReservationClick({
          button_name: "Request a Table",
          event_label: "Reservation Form Submit",
          action_type: "submit",
        });
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("submit", handleSubmit, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("submit", handleSubmit, { capture: true });
    };
  }, []);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker />
      </Suspense>
    </>
  );
}

