import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface ScrollToTopProps {
  children?: ReactNode;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });
  }, [pathname]);

  return children || null;
};

export default ScrollToTop;
