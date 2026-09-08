import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Catches OAuth error params (e.g. ?error_description=User+is+banned)
 * on ANY page and redirects to /login with a toast.
 */
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
      // Clean URL and redirect to login
      window.history.replaceState({}, '', '/');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null;
}
