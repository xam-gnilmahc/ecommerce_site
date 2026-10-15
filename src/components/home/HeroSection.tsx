import './HeroSection.css';

export default function Hero() {
  return (
    <div className="hp-root">
      <section className="hp-hero">
        <video
          className="hp-hero-video"
          src={`${process.env.PUBLIC_URL}/assests/iphone-duo.mp4`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </section>
    </div>
  );
}
