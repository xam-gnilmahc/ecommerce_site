/** Parameters for the order confirmation email */
export interface OrderEmailParams {
  userName: string;
  userEmail: string;
  cartList: unknown[];
  address: string;
  cartTotal: number;
  orderId: string;
  orderDate: string;
  singleOrderProduct: unknown;
}

/** Payload for the delivery status email sent to customers */
export interface DeliveryEmailPayload {
  userName: string;
  userEmail: string;
  orderItems: {
    name: string;
    quantity: number;
    amount: number;
    image?: string;
  }[];
  address: string;
  cartTotal: number;
  orderId: string;
  orderDate: string;
}

/** Payload for push/in-app notification */
export interface NotificationPayload {
  channel: string;
  event: string;
  message: {
    orderId?: string;
    message: string;
    type: number;
  };
}

/**
 * Sends an order confirmation email via Supabase Edge Function.
 * Called after a successful order is placed.
 */
export async function sendOrderEmail(
  userName: string,
  userEmail: string,
  cartList: unknown[],
  address: string,
  cartTotal: number,
  orderId: string,
  orderDate: string,
  singleOrderProduct: unknown
): Promise<void> {
  const payload: OrderEmailParams = {
    userName,
    userEmail,
    cartList,
    address,
    cartTotal,
    orderId,
    orderDate,
    singleOrderProduct,
  };

  try {
    await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/clever-function`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Email sending failed:', err);
  }
}

/**
 * Sends a delivery status email via Supabase Edge Function.
 * Called when order status changes to delivered.
 */
export async function sendDeliveryEmail(payload: DeliveryEmailPayload): Promise<void> {
  try {
    const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/deliveryMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Email sending failed with status:', res.status);
    } else {
      console.log('Email sent successfully');
    }
  } catch (err) {
    console.error('Email sending failed:', err);
  }
}

/**
 * Sends a push/in-app notification via Supabase Edge Function.
 * Used for real-time user alerts (order placed, status update, etc.).
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/smart-endpoint`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('push notification failed with status:', res.status);
    } else {
      console.log('Notification sent successfully');
    }
  } catch (err) {
    console.error('Notification sending failed:', err);
  }
}
