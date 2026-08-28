import Main from '../../components/home/HeroSection';
import CollectionBox from '../../components/home/CollectionBox/CollectionBox';
import BestSelling from '../../components/home/BestSelling/BestSelling';
import NotificationTicker from '../../components/common/NotificationTicker';
import { useAuth } from '../../context/authContext';

function Home() {
  const { user } = useAuth();

  return (
    <>
      {user && <NotificationTicker />}
      <Main />
      <BestSelling />
      <CollectionBox />
    </>
  );
}

export default Home;
