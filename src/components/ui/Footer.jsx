import React from 'react';
import logo from '../cart/assets/logo.png';
import paymentIcon from '../cart/assets/paymentIcon.png';
import { FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaInstagram } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';
import { FaPinterest } from 'react-icons/fa';

import { Link } from 'react-router-dom';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Subscribed Successfully');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <>
      <footer className="flex flex-col gap-8 p-6 px-4 bg-gray-50 border-t border-gray-200 sm:gap-16 sm:p-12 sm:px-8 xl:p-16 xl:px-[clamp(16px,8vw,120px)]">
        <div className="grid grid-cols-1 gap-8 pt-16 sm:grid-cols-2 sm:gap-16 xl:grid-cols-5">
          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <img src={logo} alt="" Z className="bg-transparent" />
            </div>

            <p className="text-sm text-gray-500">
              1418 River Drive, Suite 35 Cottonhall, CA 9622 United States
            </p>

            <div className="flex flex-col mb-2">
              <strong className="text-sm font-semibold"> sale@uomo.com </strong>
              <strong className="text-sm font-semibold"> +1 246-345-0695 </strong>
            </div>

            <div className="flex gap-6 w-[200px]">
              <FaFacebookF className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-900" />
              <FaXTwitter className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-900" />
              <FaInstagram className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-900" />
              <FaYoutube className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-900" />
              <FaPinterest className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-900" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h5>
            <div>
              <ul onClick={scrollToTop} className="flex flex-col gap-4 list-none">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Career
                  </Link>
                </li>
                <li>
                  <Link
                    to="*"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Affilates
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Shop</h5>
            <div>
              <ul onClick={scrollToTop} className="flex flex-col gap-4 list-none">
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Mobile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Tablet
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Monitor
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Watch
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Shop All
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Help</h5>
            <div>
              <ul onClick={scrollToTop} className="flex flex-col gap-4 list-none">
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Customer Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/loginSignUp"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Find a Store
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Legal & Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-gray-900"
                  >
                    Gift Card
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Subscribe
            </h5>
            <p className="text-sm text-gray-500">
              Be the first to get the latest news about trends, promotions, and much more!
            </p>

            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1 h-[44px] px-4 border border-gray-200 rounded-l-[10px] outline-none text-sm bg-white focus:border-gray-300"
              />
              <button
                type="submit"
                className="h-[44px] px-4 bg-primary text-white border-0 rounded-r-[10px] cursor-pointer uppercase text-xs font-semibold tracking-wider hover:bg-primary-hover"
              >
                Join
              </button>
            </form>

            <h6 className="text-sm font-medium text-gray-500">Secure Payments</h6>
            <div className="h-[30px] w-[150px] -mt-2 sm:w-[200px]">
              <img src={paymentIcon} alt="" className="w-full h-full bg-transparent" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center mt-4 border-t border-gray-200 pt-8 gap-4">
          <p className="text-gray-500">
            © {getCurrentYear()} Uomo. All Rights Reserved | Made By{' '}
            <a
              href="https://github.com/shakti177"
              target="_blank"
              rel="noreferrer"
              className="text-[#C22928] no-underline"
            >
              Max Chamling
            </a>{' '}
            with ❤️
          </p>
          <div className="flex gap-2 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-6">
              <p className="text-gray-500">Language</p>
              <select
                name="language"
                id="language"
                className="border-0 outline-none bg-transparent text-sm text-gray-500 cursor-pointer"
              >
                <option value="english">United States | English</option>
                <option value="Hindi">Hindi</option>
                <option value="Germany">Germany</option>
                <option value="French">French</option>
              </select>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-gray-500">Currency</p>
              <select
                name="currency"
                id="currency"
                className="border-0 outline-none bg-transparent text-sm text-gray-500 cursor-pointer"
              >
                <option value="USD">$ USD</option>
                <option value="INR">₹ INR</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
