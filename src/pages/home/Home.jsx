import Main from '../../components/ui/main';
import CollectionBox from '../../components/product/collectionBox/CollectionBox';
import BestSelling from '../../components/product/BestSelling/BestSelling';
import NotificationTicker from '../../components/ui/NotificationTicker';
import { useAuth } from '../../context/authContext';

function Home() {
  const { user } = useAuth();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#eff4ff',
          color: '#1d4ed8',
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: '500',
          textAlign: 'center',
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        ⚠️ This is a demo website. No real transactions are processed.
      </div>
      {user && <NotificationTicker />}
      <div style={{ height: user ? 92 : 40 }} />
      <Main />
      <BestSelling />
      <CollectionBox />
    </>
  );
}

export default Home;
