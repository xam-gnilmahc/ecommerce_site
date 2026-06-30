import { useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';

// ─── Config ───────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'visitor_tracking';
const COOKIE_MAX_AGE_DAYS = 365;
const MAX_PAGES = 5; // store only last 5 pages
const MAX_PRODUCTS = 6; // store only last 6 product IDs

// Generates a simple UUID without any library
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── slidingWindow helper ─────────────────────────────────────────────────────
//
// Keeps a list of max N items. When full, oldest drops off the front.
// If value already exists in the list, it gets moved to the end (no duplicates).
//
// Example (max = 3):
//   list = ["a", "b", "c"],  add "d"  →  ["b", "c", "d"]   "a" dropped
//   list = ["a", "b", "c"],  add "b"  →  ["a", "c", "b"]   "b" moved to end

function slidingWindow(list, newValue, max) {
  // 1. Remove newValue if it already exists (so we don't get duplicates)
  const withoutDuplicate = list.filter((item) => item !== newValue);

  // 2. Add newValue to the END (most recent)
  const withNew = [...withoutDuplicate, newValue];

  // 3. If over the limit, chop off from the FRONT (oldest goes first)
  if (withNew.length > max) {
    return withNew.slice(withNew.length - max); // keep only the last `max` items
  }

  return withNew;
}

// ─── Cookie options ───────────────────────────────────────────────────────────

function getCookieOptions() {
  return {
    path: '/',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60, // convert days to seconds
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
//
// Works for BOTH logged-in and logged-out users:
//

//   Logged in  → visitor_id = user.id  (from your auth context)
//   Logged out → visitor_id = random UUID generated once, stored in cookie
//
// When user logs in, their real user.id overwrites the anonymous UUID.
//
// Usage:
//   const { user } = useAuth();
//   const { visitor, trackProduct } = useVisitorCookie(user?.id);

export function useVisitorCookie(userId, currentPath) {
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);

  // ── Runs on page load (or when userId first becomes available) ──────────────
  useEffect(() => {
    const now = new Date().toISOString();
    const path = currentPath || window.location.pathname;

    const existing = cookies[COOKIE_NAME]; // whatever is already in the cookie

    // ── Decide the visitor_id ─────────────────────────────────────────────────
    // Priority:
    //   1. userId passed in (logged-in user) → always use this
    //   2. existing cookie already has a visitor_id → reuse it (anonymous session)
    //   3. nothing → generate a new UUID (first ever visit, not logged in)
    const visitor_id = userId || existing?.visitor_id || generateUUID();

    let updated;

    if (!existing) {
      // First ever visit — build cookie from scratch
      updated = {
        visitor_id,
        first_seen: now, // set once, never changed again
        last_seen: now,
        visit_count: 1,
        pages_visited: [path], // start tracking pages
        product_ids: [], // no products clicked yet
      };
    } else {
      // Return visit — update metadata
      updated = {
        ...existing,
        visitor_id, // if user just logged in, this upgrades anon → real id
        last_seen: now,
        visit_count: existing.visit_count + 1,
        pages_visited: slidingWindow(existing.pages_visited, path, MAX_PAGES),
      };
    }

    setCookie(COOKIE_NAME, updated, getCookieOptions());
    // Run on mount (every page load) and whenever userId changes (login/logout)
  }, [userId]); // only re-runs when userId changes (login / logout)

  // ── Call this on any product click ──────────────────────────────────────────
  const trackProduct = useCallback(
    (productId) => {
      if (!productId) return;

      const existing = cookies[COOKIE_NAME];
      if (!existing) return; // safety: cookie must exist before we can update it

      const updated = {
        ...existing, // keep everything else the same
        product_ids: slidingWindow(existing.product_ids, productId, MAX_PRODUCTS),
      };

      setCookie(COOKIE_NAME, updated, getCookieOptions());
    },
    [cookies]
  );

  // ── Call this on logout ──────────────────────────────────────────────────────
  function clearVisitor() {
    removeCookie(COOKIE_NAME, { path: '/' });
  }

  return {
    visitor: cookies[COOKIE_NAME] || null, // the full cookie data
    trackProduct, // call on product click
    clearVisitor, // call on logout
  };
}
