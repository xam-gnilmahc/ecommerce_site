import { useState, type SyntheticEvent } from 'react';
import './HeroSection.css';

const VIDEO_SRC = `${process.env.PUBLIC_URL}/assests/iphone-duo.mp4`;
const POSTER_SRC = `${process.env.PUBLIC_URL}/assests/iphone-duo-poster.jpg`;
const START_AT = 1; // seconds — matches the poster frame

export default function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  const handleLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime < START_AT) {
      video.currentTime = START_AT;
    }
  };

  return (
    <div className="hp-root">
      <section className="hp-hero">
        {!videoReady && <img className="hp-hero-poster" src={POSTER_SRC} alt="" />}
        <video
          className="hp-hero-video"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setVideoReady(true)}
        />
      </section>
    </div>
  );
}
