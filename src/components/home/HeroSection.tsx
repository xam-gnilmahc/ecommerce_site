import { useState, type SyntheticEvent } from 'react';
import './HeroSection.css';

const START_AT = 1; // seconds — matches the poster frame

// background hero clips — one is picked at random on every page load
const HERO_CLIPS = [
  {
    video: `${process.env.PUBLIC_URL}/assests/iphone-duo.mp4`,
    poster: `${process.env.PUBLIC_URL}/assests/iphone-duo-poster.jpg`,
  },
  {
    video: `${process.env.PUBLIC_URL}/assests/apple-homeview.mp4`,
    poster: `${process.env.PUBLIC_URL}/assests/apple-homeview-poster.jpg`,
  },
];

const randomClip = () => HERO_CLIPS[Math.floor(Math.random() * HERO_CLIPS.length)];

export default function Hero() {
  const [clip] = useState(randomClip); // stable across re-renders, fresh per mount
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
        {!videoReady && <img className="hp-hero-poster" src={clip.poster} alt="" />}
        <video
          key={clip.video}
          className="hp-hero-video"
          src={clip.video}
          poster={clip.poster}
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
