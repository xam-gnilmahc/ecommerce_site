// LottieLoader.js
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../lottie.json'; // Path to your Lottie JSON file

const LottieLoader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true, // Animation plays automatically
    animationData: animationData, // Your Lottie JSON
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} height={200} width={200} />;
};

export default LottieLoader;
