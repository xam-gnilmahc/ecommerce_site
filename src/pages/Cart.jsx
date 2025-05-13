import { useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast from "react-hot-toast";
import { FaCarTunnel } from "react-icons/fa6";
import LottieLoader from "../components/LottieLoader";

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const { cart, addToCart, removeFromCart, user, loading } = useAuth();
  const navigate = useNavigate();

  const updateItemQuantity = (product, action) => {
    // Find the item in the cart and update its quantity locally
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex(
      (item) => item.products.id === product.id
    );
    if (itemIndex !== -1) {
      const updatedItem = updatedCart[itemIndex];
      if (action === "increase") {
        updatedItem.quantity += 1; // Increase quantity
      } else if (action === "decrease" && updatedItem.quantity > 1) {
        updatedItem.quantity -= 1; // Decrease quantity but don't go below 1
      }

      // Update the cart state with the new quantity
      dispatch(addCart(updatedCart)); // Using redux action to update cart (you can manage state this way)

      // Also update on the backend
      if (action === "increase") {
        addToCart(product);
      } else if (action === "decrease") {
        removeFromCart(product);
      }
    }
  };

  const EmptyCart = () => (
    <div className="container py-5 text-center">
      <h3 className="mb-4">Your Cart is Empty</h3>
      <Link to="/" className="btn btn-outline-dark btn-lg">
        <i className="fa fa-arrow-left me-2"></i> Continue Shopping
      </Link>
    </div>
  );

  const ShowCart = () => {
    let subtotal = 0;
    let shipping = 30.0;
    let totalItems = 0;

    cart.forEach((item) => {
      subtotal += item.amount * item.quantity;
      totalItems += item.quantity;
    });

    return (
      <section className="py-5 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container">
        <div className="row g-4">
          {/* Cart Items Section */}
          <div className="col-12 col-lg-8">
            <div className="bg-white border border-gray-200 rounded-3 p-4">
              <h5 className="mb-4 text-xl font-semibold text-gray-800">🛒 Shopping Cart</h5>
              {cart.map((item) => (
                <div key={item.id} className="mb-4 p-3 bg-gray-50 border rounded-2">
                  <div className="d-flex flex-wrap flex-md-nowrap align-items-center gap-3">
                    {/* Product Image */}
                    <div style={{ flex: "0 0 80px" }}>
                      <img
                        src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                        alt={item.products.name}
                        className="img-fluid rounded bg-white p-2"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
    
                    {/* Product Info */}
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-gray-800">{item.products.name}</h6>
                      <p className="text-sm text-muted">Product ID: #{item.products.id}</p>
                      <div className="d-flex gap-1 mt-1">
                        {Array.from({ length: 5 }, (_, i) => {
                          const rating = item.products?.rating || 0;
                          if (rating >= i + 1) return <i key={i} className="fa fa-star text-warning"></i>;
                          else if (rating >= i + 0.5) return <i key={i} className="fa fa-star-half-o text-warning"></i>;
                          return <i key={i} className="fa fa-star-o text-warning"></i>;
                        })}
                      </div>
                    </div>
    
                    {/* Quantity & Price */}
                    <div className="text-end">
                      <div className="d-flex align-items-center gap-2 justify-content-end mb-2">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle"
                          onClick={() => updateItemQuantity(item.products, "decrease")}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-circle"
                          onClick={() => updateItemQuantity(item.products, "increase")}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <strong className="text-success">${item.amount * item.quantity}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    
          {/* Order Summary */}
          <div className="col-12 col-lg-4">
            <div className="bg-white border border-gray-200 rounded-3 p-4">
              <h5 className="mb-4 text-lg font-semibold text-gray-800">📦 Order Summary</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item d-flex justify-content-between">
                  Products ({totalItems}) <strong>${Math.round(subtotal)}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  Shipping <strong>${shipping}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong>${Math.round(subtotal + shipping)}</strong>
                </li>
              </ul>
              <Link to="/checkout" className="btn btn-success btn-lg w-100 mt-3">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    

    );
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {loading ? (
          <LottieLoader />
        ) : cart.length ? (
          <ShowCart />
        ) : (
          <EmptyCart />
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
