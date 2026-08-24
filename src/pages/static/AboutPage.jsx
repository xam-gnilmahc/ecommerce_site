import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiShield, FiCreditCard, FiHeadphones } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import './AboutPage.css';

const categories = [
  { title: 'Mobile Phones', tag: 'iPhone, Samsung & more' },
  { title: 'Laptops', tag: 'Work, gaming & everyday' },
  { title: 'Tablets', tag: 'iPad, Galaxy Tab & more' },
  { title: 'Wearables', tag: 'Watches & fitness bands' },
];

const perks = [
  {
    icon: <FiShield size={22} />,
    title: '100% Genuine Products',
    text: 'Every device is sourced from authorized distributors with full manufacturer warranty.',
  },
  {
    icon: <FiTruck size={22} />,
    title: 'Fast & Free Delivery',
    text: 'Free standard shipping on every order, or express delivery in 1–3 days when you need it fast.',
  },
  {
    icon: <FiCreditCard size={22} />,
    title: 'Secure Payments',
    text: 'Pay safely with Google Pay, credit or debit cards — powered by Stripe encryption.',
  },
  {
    icon: <FiHeadphones size={22} />,
    title: 'Real Human Support',
    text: 'Questions about an order or a device? Our support team is one message away.',
  },
];

const stats = [
  { value: '10K+', label: 'Orders delivered' },
  { value: '50+', label: 'Tech brands' },
  { value: '4.8★', label: 'Average rating' },
  { value: '24/7', label: 'Order tracking' },
];

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <p className="about-kicker">About us</p>
        <h1>
          Tech you love,
          <br />
          delivered to your door
        </h1>
        <p className="about-sub">
          UOM is an online electronics store for mobile phones, laptops, tablets and wearables.
          We keep it simple: genuine products, honest prices, and delivery that actually shows up
          on time.
        </p>
        <Link to="/search" className="about-cta">
          Start shopping <BsArrowRight />
        </Link>
      </section>

      {/* STATS */}
      <section className="about-stats">
        {stats.map((s) => (
          <div className="about-stat" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="about-section">
        <h2>What we sell</h2>
        <div className="about-cats">
          {categories.map((c) => (
            <div className="about-cat" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="about-section">
        <h2>Why shop with us</h2>
        <div className="about-perks">
          {perks.map((p) => (
            <div className="about-perk" key={p.title}>
              <span className="perk-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-banner">
        <h2>Ready to upgrade?</h2>
        <p>Browse the latest phones, laptops, tablets and watches — all in one place.</p>
        <Link to="/search" className="about-cta dark">
          Browse products <BsArrowRight />
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
