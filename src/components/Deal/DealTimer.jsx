import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './DealTimer.css';

const DealTimer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 31,
    hours: 29,
    minutes: 57,
    seconds: 17,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        seconds--;

        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }

        if (minutes < 0) {
          minutes = 59;
          hours--;
        }

        if (hours < 0) {
          hours = 23;
          days--;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => val.toString().padStart(2, '0');

  return (
    <motion.div
      className="mainDeal"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="dealTimer">
        <div className="dealOverlay"></div>

        <div className="dealTimerMainContent">
          {/* LEFT CONTENT */}

          <motion.div
            className="dealTimeContent"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <p>Deal of the Week</p>

            <h3>Iphone 16e</h3>

            <div className="dealTimeLink">
              <Link to="/shop" onClick={scrollToTop}>
                Shop Now
              </Link>
            </div>
          </motion.div>

          {/* TIMER */}

          <motion.div
            className="dealTimeCounter"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <div className="dealTimeDigit">
              <h4>{timeLeft.days}</h4>
              <p>Days</p>
            </div>

            <span>:</span>

            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.hours)}</h4>
              <p>Hours</p>
            </div>

            <span>:</span>

            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.minutes)}</h4>
              <p>Minutes</p>
            </div>

            <span>:</span>

            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.seconds)}</h4>
              <p>Seconds</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DealTimer;
