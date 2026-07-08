import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CollectionBox = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 60, scale: 1.05 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: 'easeOut',
      },
    }),
  };

  const cardBase = 'min-h-full flex flex-col justify-end rounded-lg p-[30px] relative overflow-hidden';

  const overlayStyle =
    "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/55 before:via-black/15 before:to-transparent before:rounded-lg before:z-[1] [&>*]:relative [&>*]:z-[2]";

  const shopLinkBase =
    'text-sm uppercase font-semibold text-white tracking-wide transition-colors duration-300 hover:text-[#00e5ff]';

  const colLinkBase =
    'relative w-fit ' +
    shopLinkBase +
    " after:content-[''] after:absolute after:left-0 after:bottom-[-5px] after:w-[40%] after:border-b-2 after:border-[#00e5ff] after:transition-all after:duration-300 hover:after:w-full";

  return (
    <div className="grid grid-cols-2 gap-2.5 auto-rows-[32rem] mx-8 mb-8 max-[1210px]:grid-cols-1 max-[1210px]:gap-[25px] max-[1210px]:px-[60px] max-[1210px]:auto-rows-[22rem] max-[450px]:px-[15px] max-[450px]:auto-rows-[18rem]">
      {/* iPhone */}
      <motion.div
        className={`${cardBase} ${overlayStyle}`}
        style={{
          backgroundImage:
            "url('https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-iPhone-14-Plus-hero-220907.jpg.og.jpg?202602251842')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        custom={0}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="uppercase text-sm tracking-[1.5px] text-white/75">Hot List</p>
        <h3 className="uppercase text-2xl font-semibold text-white">
          <span className="font-extrabold text-[#00e5ff]">Iphone</span> Collection
        </h3>

        <div className="mt-2">
          <Link to="/search?q=iphone" onClick={scrollToTop} className={colLinkBase}>
            Shop Now
          </Link>
        </div>
      </motion.div>

      {/* iPad */}
      <motion.div
        className={`${cardBase} ${overlayStyle}`}
        style={{
          backgroundImage:
            "url('https://store.ave.com.bn/wp-content/uploads/2021/10/iPad-mini-Avail-Web-Banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        custom={1}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="uppercase text-sm tracking-[1.5px] text-white/75">Hot List</p>
        <h3 className="uppercase text-2xl font-semibold text-white">
          <span className="font-extrabold text-[#00e5ff]">Ipad</span> Collection
        </h3>

        <div className="mt-2">
          <Link to="/search?q=ipad" onClick={scrollToTop} className={colLinkBase}>
            Shop Now
          </Link>
        </div>
      </motion.div>

      {/* Watch */}
      <motion.div
        className={`${cardBase} ${overlayStyle}`}
        style={{
          backgroundImage:
            "url('https://www.apple.com/newsroom/images/product/watch/standard/Apple_watch-series7-availability_hero_10052021_big.jpg.small_2x.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        custom={2}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="uppercase text-sm tracking-[1.5px] text-white/75">Hot List</p>
        <h3 className="uppercase text-2xl font-semibold text-white">
          <span className="font-extrabold text-[#00e5ff]">Watch</span> Collection
        </h3>

        <div className="mt-2">
          <Link to="/search?q=watch" onClick={scrollToTop} className={colLinkBase}>
            Shop Now
          </Link>
        </div>
      </motion.div>

      {/* Ear bud */}
      <motion.div
        className={`${cardBase} ${overlayStyle}`}
        style={{
          backgroundImage:
            "url('https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/og-airpods-max-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1724144125817')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        custom={3}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="uppercase text-2xl font-semibold text-white">
          <span className="font-extrabold text-[#00e5ff]">Ear bud</span> Collection
        </h3>
        <p className="uppercase text-sm tracking-[1.5px] text-white/75">
          Surprise someone with the gift they really want.
        </p>

        <div className="mt-2">
          <Link to="/search?q=earbud" onClick={scrollToTop} className={colLinkBase}>
            Shop Now
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CollectionBox;
