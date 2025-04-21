import { useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast from "react-hot-toast";
const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();


  const addItem = (product) => {
    dispatch(addCart(product));
  };

  const removeItem = (product) => {
    dispatch(delCart(product));
  };

  const EmptyCart = () => (
    <div className="container py-5 text-center">
      <h3 className="mb-4">Your Cart is Empty</h3>
      <Link to="/" className="btn btn-outline-dark btn-lg">
        <i className="fa fa-arrow-left me-2"></i> Continue Shopping
      </Link>
    </div>
  );


  useEffect(() => {
    if (!user) {
      toast.error("Please login to access your cart.");
      navigate("/login");
    }
  }, [user, navigate]);
  

  const ShowCart = () => {
    let subtotal = 0;
    let shipping = 30.0;
    let totalItems = 0;

    state.forEach((item) => {
      subtotal += item.amount * item.qty;
      totalItems += item.qty;
    });

    return (
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0 ">Shopping Cart</h5>
                </div>
                <div className="card-body">
                  {state.map((item) => (
                    <div key={item.id} className="mb-4">
                      <div className="row align-items-center">
                        <div className="col-3">
                          <img
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                            alt={item.name}
                            className="img-fluid rounded"
                            style={{
                              width:"200px",
                              height: "80px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div className="col-5">
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">Product ID: {item.id}</small>
                        </div>
                        <div className="col-4 text-end">
                          <div className="d-flex justify-content-end align-items-center mb-2">
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => removeItem(item)}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span className="mx-3">{item.qty}</span>
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => addItem(item)}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <strong>${item.amount * item.qty}</strong>
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
        <h1 className="text-center mb-4">Your Shopping Cart</h1>
        {state.length > 0 ? <ShowCart /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
