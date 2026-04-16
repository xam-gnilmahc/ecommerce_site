/**
 * Tracking helpers
 * Provides small helper functions to dispatch tracking thunks
 * and only run them for logged-in users.
 *
 * Usage examples:
 * import { trackSearch, trackAddToCart } from '../utils/tracking';
 * await trackSearch(dispatch, userId, 'iphone');
 */
import { trackUserActivity, trackBulkActivity } from '../redux/slice/trackingSlice.ts';

/**
 * Dispatch trackUserActivity only if userId exists (logged in).
 * @param {Function} dispatch - redux dispatch
 * @param {string|undefined|null} userId
 * @param {Object} payload - additional fields for the TrackPayload
 */
export async function trackIfLoggedIn(dispatch, userId, payload) {
  if (!userId) return null; // skip for anonymous users

  try {
    // dispatching the async thunk returns a promise with .unwrap()
    const res = await dispatch(trackUserActivity({ userId, ...payload })).unwrap();
    return res;
  } catch (err) {
    // non-fatal: log and continue
    // err may be a string from rejectWithValue or an Error
    // keep console.warn rather than throwing to avoid breaking UX
    // caller may handle returned value if needed
    // eslint-disable-next-line no-console
    console.warn('trackIfLoggedIn failed', err);
    return null;
  }
}
 
/**
 * Track a search event
 * @param {Function} dispatch
 * @param {string} userId
 * @param {string} keyword
 */
export async function trackSearch(dispatch, userId, keyword) {
  if (!keyword) return null;
  return trackIfLoggedIn(dispatch, userId, { type: 'search', keyword });
}

/**
 * Track a product preview/view
 * @param {Function} dispatch
 * @param {string} userId
 * @param {Object} product - product object (id or productId, category optional)
 */
export async function trackProductPreview(dispatch, userId, product) {
  const productId = product?.id ?? product?.productId;
  return trackIfLoggedIn(dispatch, userId, {
    type: 'product_view',
    productId: productId != null ? String(productId) : undefined,
    category: product?.category,
  });
}

/**
 * Track add-to-cart event
 * @param {Function} dispatch
 * @param {string} userId
 * @param {Object} product
 */
export async function trackAddToCart(dispatch, userId, product) {
  const productId = product?.id ?? product?.productId;
  return trackIfLoggedIn(dispatch, userId, {
    type: 'cart',
    productId: productId != null ? String(productId) : undefined,
    category: product?.category,
  });
}

/**
 * Track purchase/order events.
 * Sends one order-level purchase event and (optionally) bulk item events.
 * @param {Function} dispatch
 * @param {string} userId
 * @param {Object} order - order object { id, items: [{ productId, category, ... }] }
 */
export async function trackPurchase(dispatch, userId, order) {
  if (!userId) return null;

  // Track a single order-level purchase event
  return trackIfLoggedIn(dispatch, userId, {
    type: 'purchase',
    keyword: order?.id != null ? String(order.id) : undefined,
  });
}

export default {
  trackIfLoggedIn,
  trackSearch,
  trackProductPreview,
  trackAddToCart,
  trackPurchase,
};
