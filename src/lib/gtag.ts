export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export type GTagEventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetIdOrAction: string | Date,
      configOrParams?: GTagEventParams | string
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Log page views on client-side route changes
 */
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_location: window.location.href,
    });
  }
};

/**
 * Log generic custom events
 */
export const event = (action: string, params: GTagEventParams = {}) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
};

export interface BaseClickParams {
  event_label?: string;
  link_url?: string;
  button_name?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface PhoneClickParams extends BaseClickParams {
  phone?: string;
  phone_number?: string;
}

/**
 * WhatsApp button click event
 */
export const trackWhatsAppClick = (params: BaseClickParams = {}) => {
  event("whatsapp_click", {
    event_category: "contact",
    event_label: params.event_label || params.button_name || "WhatsApp",
    link_url: params.link_url,
    transport_type: "beacon",
    ...params,
  });
};

/**
 * Phone call button click event
 */
export const trackPhoneClick = (params: PhoneClickParams = {}) => {
  event("phone_click", {
    event_category: "contact",
    event_label: params.event_label || params.phone || "Phone Call",
    phone_number: params.phone,
    link_url: params.link_url,
    transport_type: "beacon",
    ...params,
  });
};

/**
 * Menu button click event
 */
export const trackMenuClick = (params: BaseClickParams = {}) => {
  event("menu_click", {
    event_category: "navigation",
    event_label: params.event_label || params.button_name || "Menu",
    link_url: params.link_url || "/menu",
    ...params,
  });
};

/**
 * Reservation button click event
 */
export const trackReservationClick = (params: BaseClickParams = {}) => {
  event("reservation_click", {
    event_category: "reservation",
    event_label: params.event_label || params.button_name || "Reservation",
    link_url: params.link_url,
    ...params,
  });
};
