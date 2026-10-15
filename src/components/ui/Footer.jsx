import React, { useState, useEffect } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Policies',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/terms' },
      { label: 'Website Accessibility', to: '/terms' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Customer Service', to: '/contact' },
      { label: 'My Account', to: '/login' },
      { label: 'Orders', to: '/order' },
      { label: 'Shipping', to: '/terms' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'Shop All', to: '/search' },
      { label: 'Mobile', to: '/search?q=mobile' },
      { label: 'Laptop', to: '/search?q=laptop' },
      { label: 'Tablet', to: '/search?q=tablet' },
      { label: 'Watch', to: '/search?q=watch' },
    ],
  },
];

const FooterColumn = ({ title, links }) => {
  const [isDesktop, setIsDesktop] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 750px)');
    const apply = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setOpen(true);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const isOpen = isDesktop || open;

  return (
    <details
      className="footer-menu"
      open={isOpen}
      onToggle={(e) => {
        if (!isDesktop) setOpen(e.target.open);
      }}
    >
      <summary className="footer-menu__heading">{title}</summary>
      <ul className="footer-menu__list">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </details>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        {COLUMNS.map((column) => (
          <FooterColumn key={column.title} title={column.title} links={column.links} />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
