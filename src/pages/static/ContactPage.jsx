import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import './ContactPage.css';

const contactCards = [
  {
    icon: <FiMail size={20} />,
    title: 'Email us',
    lines: ['support@uom.store', 'We reply within 24 hours'],
  },
  {
    icon: <FiPhone size={20} />,
    title: 'Call us',
    lines: ['+44 20 7123 4567', 'Mon–Sat, 9am–6pm'],
  },
  {
    icon: <FiMapPin size={20} />,
    title: 'Visit us',
    lines: ['1418 River Drive, Suite 35', 'Cottonhall, CA 9622, UK'],
  },
  {
    icon: <FiClock size={20} />,
    title: 'Order support',
    lines: ['Track anytime from Orders', '24/7 status updates'],
  },
];

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    // simulate sending — wire this to your backend / email service later
    setTimeout(() => {
      setSending(false);
      toast.success(`Thanks ${name.split(' ')[0]}! We'll get back to you soon.`);
      setName('');
      setEmail('');
      setMessage('');
    }, 800);
  };

  return (
    <div className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <p className="contact-kicker">Contact</p>
        <h1>
          We're here
          <br />
          to help
        </h1>
        <p className="contact-sub">
          Question about an order, a product, or a delivery? Reach out — a real person will get
          back to you.
        </p>
      </section>

      {/* INFO CARDS */}
      <section className="contact-cards">
        {contactCards.map((c) => (
          <div className="contact-card" key={c.title}>
            <span className="card-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>
              {c.lines[0]}
              <br />
              <span>{c.lines[1]}</span>
            </p>
          </div>
        ))}
      </section>

      {/* FORM + SIDE */}
      <section className="contact-main">
        <div className="contact-form-wrap">
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Your name
                <input
                  type="text"
                  value={name}
                  placeholder="John Carter"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  placeholder="john@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Message
              <textarea
                rows={6}
                value={message}
                placeholder="How can we help?"
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'} <FiSend />
            </button>
          </form>
        </div>

        <aside className="contact-aside">
          <h3>Looking for something else?</h3>
          <Link to="/order" className="aside-link">
            Track an order <BsArrowRight />
          </Link>
          <Link to="/search" className="aside-link">
            Browse products <BsArrowRight />
          </Link>
          <div className="aside-note">
            For order issues, have your order number ready — it's in your confirmation email and
            on the Orders page.
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ContactPage;
