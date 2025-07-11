import {  Main} from "../components";
import Filters from "../components/Filter";
import HeroSection from "./HeroSection";
import CollectionBox from "../components/collectionBox/CollectionBox";
import DealTimer from "../components/Deal/DealTimer";
import BestSelling from "../components/BestSelling/BestSelling";
import Banner from "../components/Banner/Banner";
function Home() {
  return (
    <>
      {/* <HeroSection/> */}
      <Main/>
      <BestSelling/>
      <CollectionBox/>
      <DealTimer/>
      <Banner/>

    </>
  )
}

export default Home