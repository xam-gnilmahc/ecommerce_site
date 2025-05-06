// LottieLoader.js
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../lottie.json'; 
import altAnimation from '../animation.json';

const LottieLoader = ({ useAlt }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: useAlt ? altAnimation : animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} height={200} width={200} />;
};

export default LottieLoader;
