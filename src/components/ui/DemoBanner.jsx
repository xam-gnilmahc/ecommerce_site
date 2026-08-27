import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import './DemoBanner.css';

const DemoBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="demo-sticker">
      <button className="demo-sticker-close" onClick={() => setVisible(false)} aria-label="Close demo sticker">
        <IoClose size={13} />
      </button>
      <span className="demo-sticker-text">DEMO SITE</span>
      <span className="demo-sticker-sub">no real orders</span>
    </div>
  );
};

export default DemoBanner;
