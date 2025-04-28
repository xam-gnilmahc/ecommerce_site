import emailjs from 'emailjs-com';

const EMAILJS_SERVICE_ID = "service_r6qpoph";
const EMAILJS_TEMPLATE_ID = "template_qilvix4";
const EMAILJS_PUBLIC_KEY = "1R9t0eTK0Mvnd6982"; // You can remove this if you are not using it here

emailjs.init('1R9t0eTK0Mvnd6982');

// Function to generate a random 12-digit Order ID
const generateOrderId = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

const getPublicImageUrl = (fileName) => 
    `https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${encodeURIComponent(fileName)}`;
  

// Function to generate cart items HTML
const generateCartItemsHTML = (cartList) => {
  if (!Array.isArray(cartList)) {
    return ''; // Return empty string if cartList is not an array
  }
  return cartList.map((item) => `
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; border-radius: 8px; background-color: #f8f9fa;">
    <div style="display: flex; align-items: center; flex: 1; min-width: 250px;">
      <img 
        src="${getPublicImageUrl(item.products.banner_url)}"
        alt="${item.products.banner_url}" 
        style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px; margin-right: 15px; background-color: white; padding: 5px;"
      />
      <div>
        <p style="font-size: 16px; font-weight: bold; margin: 0; color: #121212;">${item.products.name}</p>
        <p style="font-size: 14px; margin: 5px 0 0; color: #121212;">$${item.amount}</p>
      </div>
    </div>

    <div style="flex-shrink: 0; min-width: 200px; text-align: right; margin-top: 10px;">
      <div style="font-size: 14px; color: #555;">Quantity</div>
      <p style="margin: 5px 0 0; color: #1D3425; font-weight: bold;">${item.quantity}</p>
    </div>
  </div>
`).join('');

};

// Main function to send order email
const sendOrderEmail = async (userName, userEmail, cartList, cartTotal = 100) => {
  const orderId = generateOrderId(); // Generate random Order ID
  const orderDate = new Date().toDateString() + " " + new Date().toLocaleTimeString();

  const cartItemsHTML = generateCartItemsHTML(cartList);

  // Define template parameters for EmailJS
  const templateParams = {
    discount: ((20 / 100) * cartTotal).toFixed(2).toString(),
    deliveryFee: 30,
    from_name: userName || "ashima sharma",
    form_name: userName || "ashima sharma",
    to_email: userEmail || "maxrai788@gmail.com",
    order_id: orderId,
    order_date: orderDate,
    cart_list: cartItemsHTML, // Convert cart list to string
    cart_total: cartTotal,
    cart_sum: (cartTotal - (20 / 100) * cartTotal + 15 ).toFixed(2).toString()
  };

  try {
    // Sending the email using EmailJS
    const response = await emailjs.send(
        "service_r6qpoph",   // Service ID
        "template_qilvix4",   // Template ID
        templateParams
      );
    console.log("Email sent:", response.status, response.text);
    return { success: true, orderId }; // Return Order ID for reference
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err };
  }
};

export default sendOrderEmail;
