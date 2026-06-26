import Main from '../../components/ui/main';
import CollectionBox from '../../components/product/collectionBox/CollectionBox';
import BestSelling from '../../components/product/BestSelling/BestSelling';

function Home() {
  return (
    <>
      <div
        style={{
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          padding: '12px 14px',
          fontSize: '13px',
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        ⚠️ This is a demo website. No real transactions are processed.
      </div>
      <Main />
      <BestSelling />
      <CollectionBox />
    </>
  );
}

export default Home;
