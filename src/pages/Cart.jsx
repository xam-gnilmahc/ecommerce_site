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
    const itemIndex = updatedCart.findIndex((item) => item.products.id === product.id);
    if (itemIndex !== -1) {
      const updatedItem = updatedCart[itemIndex];
      if (action === "increase") {
        updatedItem.quantity += 1;  // Increase quantity
      } else if (action === "decrease" && updatedItem.quantity > 1) {
        updatedItem.quantity -= 1;  // Decrease quantity but don't go below 1
      }

      // Update the cart state with the new quantity
      dispatch(addCart(updatedCart));  // Using redux action to update cart (you can manage state this way)

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
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">Shopping Cart</h5>
                </div>
                <div className="card-body">
                  {cart.map((item) => (
                    <div key={item.id} className="mb-4">
                      <div className="row align-items-center">
                        <div className="col-3">
                          <img
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                            alt={item.products.name}
                            className="img-fluid rounded"
                            style={{
                              width: "200px",
                              height: "80px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div className="col-5">
                          <h6 className="mb-0">{item.products.name}</h6>
                          <p className="lead mt-1 d-flex align-items-center justify-content-center justify-content-md-start gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const rating = item.products?.rating || 0;
                            if (rating >= i + 1) {
                              return <i key={i} className="fa fa-star text-warning"></i>; // full star
                            } else if (rating >= i + 0.5) {
                              return <i key={i} className="fa fa-star-half-o text-warning"></i>; // half star
                            } else {
                              return <i key={i} className="fa fa-star-o text-warning"></i>; // empty star
                            }
                          })}
                        </p>
                        </div>
                        <div className="col-4 text-end">
                          <div className="d-flex justify-content-end align-items-center mb-2">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => updateItemQuantity(item.products, "decrease")}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => updateItemQuantity(item.products, "increase")}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <strong>${item.amount * item.quantity}</strong>
                        </div>
                      </div>
                      <hr />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
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
                  <Link to="/checkout" className="btn btn-dark btn-lg w-100">
                    Proceed to Checkout
                  </Link>
                </div>
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
        {loading ? <LottieLoader /> : cart.length ? <ShowCart /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
