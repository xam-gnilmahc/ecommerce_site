import Main from '../../components/ui/main';
import CollectionBox from '../../components/product/collectionBox/CollectionBox';
import BestSelling from '../../components/product/BestSelling/BestSelling';
import NotificationTicker from '../../components/ui/NotificationTicker';
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
