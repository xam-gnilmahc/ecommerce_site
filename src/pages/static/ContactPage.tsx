import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import './ContactPage.css';

interface ContactCard {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}

const contactCards: ContactCard[] = [
  {
    icon: <FiMail size={16} />,
    title: 'Email us',
    lines: ['support@uom.store', 'We reply within 24 hours'],
  },
  {
    icon: <FiPhone size={16} />,
    title: 'Call us',
    lines: ['+44 20 7123 4567', 'Mon–Sat, 9am–6pm'],
  },
  {
    icon: <FiMapPin size={16} />,
    title: 'Visit us',
    lines: ['1418 River Drive, Suite 35', 'Cottonhall, CA 9622, UK'],
  },
  {
    icon: <FiClock size={16} />,
    title: 'Order support',
    lines: ['Track anytime from Orders', '24/7 status updates'],
  },
];

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="ct-page">
      <div className="ct-container">
        {/* ── HEADER ─────────────────────────────── */}
        <header className="ct-head">
          <p className="ct-eyebrow">Contact</p>
          <h1 className="ct-title">We're here to help</h1>
          <p className="ct-subtitle">
            Question about an order, a product, or a delivery? Reach out — a real person will get
            back to you.
          </p>
        </header>

        {/* ── CONTACT DETAILS ────────────────────── */}
        <section className="ct-info">
          {contactCards.map((c) => (
            <div className="ct-info-item" key={c.title}>
              <span className="ct-info-icon">{c.icon}</span>
              <div className="ct-info-body">
                <p className="ct-info-title">{c.title}</p>
                <p className="ct-info-line">{c.lines[0]}</p>
                <p className="ct-info-note">{c.lines[1]}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── FORM + ASIDE ───────────────────────── */}
        <section className="ct-main">
          <div className="ct-form">
            <h2 className="ct-section-title">Send us a message</h2>

            <form onSubmit={handleSubmit}>
              <div className="ct-field-row">
                <label className="ct-field">
                  Your name
                  <input
                    type="text"
                    value={name}
                    placeholder="John Carter"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="ct-field">
                  Email address
                  <input
                    type="email"
                    value={email}
                    placeholder="john@example.com"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="ct-field">
                Message
                <textarea
                  rows={6}
                  value={message}
                  placeholder="How can we help?"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                  required
                />
              </label>

              <button type="submit" className="ct-submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <aside className="ct-aside">
            <h2 className="ct-section-title">Looking for something else?</h2>
            <Link to="/order" className="ct-aside-link">
              Track an order <BsArrowRight />
            </Link>
            <Link to="/search" className="ct-aside-link">
              Browse products <BsArrowRight />
            </Link>
            <p className="ct-aside-note">
              For order issues, have your order number ready — it's in your confirmation email and
              on the Orders page.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
