import { trackUserActivity, TrackType } from '../redux/slice/trackingSlice.ts';

type AppDispatch = (action: unknown) => unknown;

/** Minimal product object used for tracking view/cart events */
export interface Product {
  id?: string | number;
  productId?: string | number;
  category?: string;
}

/** Minimal order object used for tracking purchase events */
export interface Order {
  id?: string | number;
}

/**
 * Dispatches a user activity tracking event only if the user is logged in.
 * Skips silently for anonymous users (no userId).
 */
export async function trackIfLoggedIn(
  dispatch: AppDispatch,
  userId: string | undefined | null,
  payload: { type: TrackType; productId?: string; category?: string; keyword?: string }
): Promise<unknown> {
  if (!userId) return null;

  try {
    const action = trackUserActivity({ userId, ...payload });
    const res = await (dispatch(action) as Promise<unknown>).then((r) => r);
    return res;
  } catch (err) {
    console.warn('trackIfLoggedIn failed', err);
    return null;
  }
}

/**
 * Tracks a search event — records what keyword the user searched for.
 */
export async function trackSearch(
  dispatch: AppDispatch,
  userId: string | undefined | null,
  keyword: string
): Promise<unknown> {
  if (!keyword) return null;
  return trackIfLoggedIn(dispatch, userId, { type: 'search', keyword });
}

/**
 * Tracks a product view/preview event — records which product the user looked at.
 */
export async function trackProductPreview(
  dispatch: AppDispatch,
  userId: string | undefined | null,
  product: Product
): Promise<unknown> {
  const productId = product?.id ?? product?.productId;
  return trackIfLoggedIn(dispatch, userId, {
    type: 'view',
    productId: productId != null ? String(productId) : undefined,
    category: product?.category,
  });
}

/**
 * Tracks an add-to-cart event — records which product the user added to their cart.
 */
export async function trackAddToCart(
  dispatch: AppDispatch,
  userId: string | undefined | null,
  product: Product
): Promise<unknown> {
  const productId = product?.id ?? product?.productId;
  return trackIfLoggedIn(dispatch, userId, {
    type: 'cart',
    productId: productId != null ? String(productId) : undefined,
    category: product?.category,
  });
}

/**
 * Tracks a purchase/order completion event — records the order ID for the user.
 */
export async function trackPurchase(
  dispatch: AppDispatch,
  userId: string | undefined | null,
  order: Order
): Promise<unknown> {
  if (!userId) return null;

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
