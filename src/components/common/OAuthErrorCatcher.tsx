import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthErrorCatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');

    if (errorDescription) {
      const message = decodeURIComponent(errorDescription);
      if (errorCode === 'user_banned') {
        toast.error(`Account banned: ${message}`);
      } else {
        toast.error(message);
      }
      window.history.replaceState({}, '', '/');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null;
}
