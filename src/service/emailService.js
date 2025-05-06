export async function sendOrderEmail(
  userName,
  userEmail,
  cartList,
  address,
  cartTotal
) {
  const payload = { userName, userEmail, cartList, address, cartTotal };
  
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
    
    console.log(await res.json());
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}
