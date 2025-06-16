import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./DealTimer.css";

const DealTimer = () => {
  const timerRef = useRef(null);
  const [inView, setInView] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

 useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setInView(entry.isIntersecting);
    },
    { threshold: 0.3 }
  );

  if (timerRef.current) observer.observe(timerRef.current);
  return () => observer.disconnect();
}, []);


  const formatTime = (val) => val.toString().padStart(2, "0");

  return (
    <div
      ref={timerRef}
      className={`mainDeal bg-slide ${inView ? "in-view" : ""}`}
    >
      <div className="dealTimer">
        <div className="dealTimerMainContent">
          <div className="dealTimeContent">
            <p>Deal of the Week</p>
            <h3>Iphone 16e</h3>
            <div className="dealTimeLink">
              <Link to="/shop" onClick={scrollToTop}>
                Shop Now
              </Link>
            </div>
          </div>

          <div className="dealTimeCounter">
            <div className="dealTimeDigit">
              <h4>{timeLeft.days}</h4>
              <p>Days</p>
            </div>
            <h4>:</h4>
            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.hours)}</h4>
              <p>Hours</p>
            </div>
            <h4>:</h4>
            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.minutes)}</h4>
              <p>Minutes</p>
            </div>
            <h4>:</h4>
            <div className="dealTimeDigit">
              <h4>{formatTime(timeLeft.seconds)}</h4>
              <p>Seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealTimer;
