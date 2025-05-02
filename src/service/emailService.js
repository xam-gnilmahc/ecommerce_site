export async function sendOrderEmail(
  userName,
  userEmail,
  cartList,
  address,
  cartTotal,
) {
  const payload = { userName, userEmail, cartList, address , cartTotal };
  try {
    const res = await fetch(
      "https://fzliiwigydluhgbuvnmr.supabase.co/functions/v1/clever-function",
      {
        method: "POST",
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bGlpd2lneWRsdWhnYnV2bm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjkxNTMsImV4cCI6MjA1NzUwNTE1M30.w3Y7W14lmnD-gu2U4dRjqIhy7JZpV9RUmv8-1ybQ92w', // Your Bearer Token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Include your payment data here
      }
    );
    console.log(await res.json());
  } catch (err) {
    console.log(err);
  }
}
