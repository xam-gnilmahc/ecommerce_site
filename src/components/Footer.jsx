import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5">
      {/* Newsletter */}
      <div className="container text-center text-md-start">
        <div className="row py-4 border-bottom border-secondary">
          <div className="col-md-6 mb-3 mb-md-0">
            <h5 className="mb-3">Subscribe to our Ecommerce site</h5>
            <form className="d-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="Enter your email"
              />
              <button className="btn btn-warning">Subscribe</button>
            </form>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end align-items-center">
            <div>
              <h6 className="mb-3">Follow us</h6>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container text-center text-md-start mt-5">
        <div className="row mt-3">
          {/* Shop */}
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mb-4">
            <h6 className="text-uppercase fw-bold mb-4">Shop</h6>
            <p><a href="#" className="text-reset text-decoration-none">Men's Fashion</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Women's Fashion</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Accessories</a></p>
            <p><a href="#" className="text-reset text-decoration-none">New Arrivals</a></p>
          </div>

          {/* Company */}
          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 className="text-uppercase fw-bold mb-4">Company</h6>
            <p><a href="#" className="text-reset text-decoration-none">About Us</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Careers</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Blog</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Privacy Policy</a></p>
          </div>

          {/* Customer Service */}
          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 className="text-uppercase fw-bold mb-4">Support</h6>
            <p><a href="#" className="text-reset text-decoration-none">Contact Us</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Order Tracking</a></p>
            <p><a href="#" className="text-reset text-decoration-none">Returns</a></p>
            <p><a href="#" className="text-reset text-decoration-none">FAQs</a></p>
          </div>

          {/* Contact */}
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
            <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
            <p><i className="fas fa-home me-3"></i> 123 Market St, New York, NY 10012</p>
            <p><i className="fas fa-envelope me-3"></i> support@shopifyclone.com</p>
            <p><i className="fas fa-phone me-3"></i> +1 234 567 890</p>
            <p><i className="fas fa-print me-3"></i> +1 234 567 891</p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center p-4 border-top border-secondary mt-4">
        <div className="d-flex justify-content-center align-items-center">
          <span className="me-2">© 2024 ShopifyClone. All rights reserved.</span>
          <div className="ms-3">
            <i className="fab fa-cc-visa fs-4 me-2"></i>
            <i className="fab fa-cc-mastercard fs-4 me-2"></i>
            <i className="fab fa-cc-paypal fs-4"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
