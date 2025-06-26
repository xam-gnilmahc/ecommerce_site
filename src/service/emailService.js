export async function sendOrderEmail(
  userName,
  userEmail,
  cartList,
  address,
  cartTotal,
  orderId,
  orderDate
) {
  const payload = { userName, userEmail, cartList, address, cartTotal,orderId,orderDate };
  
  try {
    const res = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/clever-function`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}

export async function sendDeliveryEmail(
  payload
) {

  try {
  
    const res = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/deliveryMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

     if (!res.ok) {
      console.error("Email sending failed with status:", res.status);
    } else {
      console.log("Email sent successfully");
    }
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}

export async function sendNotification(
  payload
) {

  try {
  
    const res = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/smart-endpoint`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("push notification failed with status:", res.status);
    } else {
      console.log("Notification sent successfully");
    }
  } catch (err) {
    console.error("Notification sending failed:", err);
  }
}