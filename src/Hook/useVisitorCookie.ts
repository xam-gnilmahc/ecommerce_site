import { useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';

const COOKIE_NAME = 'visitor_tracking';
const COOKIE_MAX_AGE_DAYS = 365;
const MAX_PAGES = 5;
const MAX_PRODUCTS = 6;

/** Stored visitor tracking data in the cookie */
export interface VisitorData {
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  visit_count: number;
  pages_visited: string[];
  product_ids: string[];
}

/** Cookie set/get options */
interface CookieOptions {
  path: string;
  maxAge: number;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
}

/** Generates a simple UUID v4 without any external library */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Keeps a sliding window of max N items. If value already exists it moves
 * to the end (no duplicates). When full, oldest drops off the front.
 */
function slidingWindow(list: string[], newValue: string, max: number): string[] {
  const withoutDuplicate = list.filter((item) => item !== newValue);
  const withNew = [...withoutDuplicate, newValue];

  if (withNew.length > max) {
    return withNew.slice(withNew.length - max);
  }

  return withNew;
}

/** Returns cookie configuration with 1-year expiry, secure, sameSite lax */
function getCookieOptions(): CookieOptions {
  return {
    path: '/',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  };
}

/**
 * React hook for visitor tracking via cookies.
 * Works for both logged-in and logged-out users.
 *   Logged in  → visitor_id = user.id
 *   Logged out → visitor_id = random UUID stored in cookie
 * Returns the visitor data, a trackProduct callback, and clearVisitor for logout.
 */
export function useVisitorCookie(userId?: string, currentPath?: string) {
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);

  useEffect(() => {
    const now = new Date().toISOString();
    const path = currentPath || window.location.pathname;

    const existing: VisitorData | undefined = cookies[COOKIE_NAME];

    const visitor_id = userId || existing?.visitor_id || generateUUID();

    let updated: VisitorData;

    if (!existing) {
      updated = {
        visitor_id,
        first_seen: now,
        last_seen: now,
        visit_count: 1,
        pages_visited: [path],
        product_ids: [],
      };
    } else {
      updated = {
        ...existing,
        visitor_id,
        last_seen: now,
        visit_count: existing.visit_count + 1,
        pages_visited: slidingWindow(existing.pages_visited, path, MAX_PAGES),
      };
    }

    setCookie(COOKIE_NAME, updated, getCookieOptions());
  }, [userId]);

  /**
   * Adds a product ID to the visitor's tracked product list.
   * Call this when a user clicks/views a product.
   */
  const trackProduct = useCallback(
    (productId: string) => {
      if (!productId) return;

      const existing: VisitorData | undefined = cookies[COOKIE_NAME];
      if (!existing) return;

      const updated: VisitorData = {
        ...existing,
        product_ids: slidingWindow(existing.product_ids, productId, MAX_PRODUCTS),
      };

      setCookie(COOKIE_NAME, updated, getCookieOptions());
    },
    [cookies]
  );

  /** Removes the visitor tracking cookie — call on user logout */
  function clearVisitor(): void {
    removeCookie(COOKIE_NAME, { path: '/' });
  }

  return {
    visitor: (cookies[COOKIE_NAME] as VisitorData) || null,
    trackProduct,
    clearVisitor,
  };
}
