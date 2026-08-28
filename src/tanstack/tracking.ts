import { supabase } from '../supaBaseClient';

export type TrackType = 'search' | 'view' | 'click' | 'cart' | 'purchase';

interface TrackPayload {
  userId: string;
  type: TrackType;
  productId?: string;
  category?: string;
  keyword?: string;
}

async function trackActivity(payload: TrackPayload): Promise<void> {
  if (!payload.userId) return;
  try {
    await supabase.from('user_activity').insert([
      {
        user_id: payload.userId,
        type: payload.type,
        product_id: payload.productId || null,
        category: payload.category || null,
        keyword: payload.keyword || null,
      },
    ]);
  } catch (err) {
    console.warn('trackActivity failed', err);
  }
}

export async function trackSearch(
  userId: string | undefined | null,
  keyword: string
): Promise<void> {
  if (!userId || !keyword) return;
  await trackActivity({ userId, type: 'search', keyword });
}

export async function trackProductPreview(
  userId: string | undefined | null,
  product: { id?: string | number; category?: string }
): Promise<void> {
  if (!userId) return;
  const productId = product?.id != null ? String(product.id) : undefined;
  await trackActivity({ userId, type: 'view', productId, category: product?.category });
}

export async function trackAddToCart(
  userId: string | undefined | null,
  product: { id?: string | number; category?: string }
): Promise<void> {
  if (!userId) return;
  const productId = product?.id != null ? String(product.id) : undefined;
  await trackActivity({ userId, type: 'cart', productId, category: product?.category });
}

export async function trackPurchase(
  userId: string | undefined | null,
  order: { id?: string | number }
): Promise<void> {
  if (!userId) return;
  const keyword = order?.id != null ? String(order.id) : undefined;
  await trackActivity({ userId, type: 'purchase', keyword });
}
