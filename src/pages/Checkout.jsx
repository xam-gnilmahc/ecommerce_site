import { useState, useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Country, State } from "country-state-city";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from '../context/authContext'; // adjust path if needed
import sendOrderEmail from "../service/emailService";

// Stripe Publishable Key (this key should be used in the frontend only)
const stripePromise = loadStripe("pk_test_51PGec42K0njal9PzJzzxwBOVszXOkqMCBcovRYFChW727EsjLGJ9sWMvztGAGnnmVAtquHDgSllxMryuvfgnv87D00nc9a1Yp7");

const Checkout = () => {
  const { user , removeFromCartAfterOrder, cart} = useAuth(); // get user and logout from context

  const state = useSelector((state) => state.handleCart);
  const elements = useElements();
  const stripe = useStripe();

  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe.js hasn't loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError("Card element is not mounted properly. Please reload and try again.");
      toast.error("Card element not found.");
      return;
    }

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setPaymentError(error.message);
      toast.error(`Payment failed: ${error.message}`);
    } else {
      let subtotal = 0;
      let shipping = 30.0;
      let totalItems = 0;
      cart.map((item) => {
        subtotal += item.amount * item.quantity;
        totalItems += item.quantity;
      });

      const totalAmount = Math.round((subtotal + shipping));
      const data = {
        payment_method_id: token.id,
        amount: totalAmount, // Dynamically set this as needed
        member_name: user.full_name,
        member_email: user.email,
        comment: 'Payment for order #12345'
      };

      setLoading(true); // Set loading to true when payment is being processed

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/payments/process', data, {
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3JlZ2lzdGVyIiwiaWF0IjoxNzQ1Mzk3NjYxLCJleHAiOjE3NDU0MDEyNjEsIm5iZiI6MTc0NTM5NzY2MSwianRpIjoidnV1R1VkaUh1MmU2VlVhZSIsInN1YiI6IjExNiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJzdG9yZV9pZCI6NDQ2NjY4NCwiZW1haWwiOiJzdGVfcmFyZV82ODA1ZTY4ZmI5YmEyQHZveG1nLmNvbSJ9.2XypPdj6zQ6p11ilMxhsZrpKG2FrbBbtlQ5OUn_qAyA',
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          await sendOrderEmail(user.full_name, user.email, cart, totalAmount);
          localStorage.removeItem('cart');
          toast.success("Payment processed successfully!");
          await removeFromCartAfterOrder();
        } else {
          toast.error("Payment processing failed.");
        }
      } catch (err) {
        console.log(err);
        const errorMessage = err.response?.data?.errors?.error_message || err.response?.data?.message || 'Payment failed';
        setPaymentError(errorMessage);
        toast.error(`Payment error: ${errorMessage}`);
      } finally {
        setLoading(false); // Set loading to false once payment processing is done
      }
    }
  };


  const EmptyCart = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 py-5 bg-light text-center">
            <h4 className="p-3 display-5">No item in Cart</h4>
            <Link to="/" className="btn btn-outline-dark mx-4">
              <i className="fa fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ShowCheckout = () => {
    let subtotal = 0;
    let shipping = 30.0;
    let totalItems = 0;
    cart.map((item) => {

      return (subtotal += item.amount * item.quantity);
    });

    cart.map((item) => {
      return (totalItems += item.quantity);
    });


    return (
      <div className="container py-5">
        <div className="row my-4">
          <div className="col-md-5 col-lg-4 order-md-last">
            <div className="card mb-4">
              <div className="card-header py-3 bg-primary text-white">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                    Products ({totalItems})<span>${Math.round(subtotal)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    Shipping
                    <span>${shipping}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                    <div>
                      <strong>Total amount</strong>
                    </div>
                    <span>
                      <strong>${Math.round(subtotal + shipping)}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-7 col-lg-8">
            <div className="card mb-4">
              <div className="card-header py-3 bg-light">
                <h4 className="mb-0">Payment</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <CardElement />
                  <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading || !stripe}>
                    {loading ? 'Submitting Payment...' : 'Submit Payment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center mb-4">Checkout</h1>
        <hr />
        {cart.length ? <ShowCheckout /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

// Wrap Checkout component with Elements provider
export default () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);
