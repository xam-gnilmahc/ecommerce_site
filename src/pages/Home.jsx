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
      <div
      style={{
        background: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffeeba",
        padding: "12px 14px",
        fontSize: "13px",
        fontWeight: "500",
        textAlign: "center",
      }}
    >
      ⚠️ This is a demo website. No real transactions are processed.
    </div>
      {/* <HeroSection/> */}
      <Main/>
      <BestSelling/>
      <CollectionBox/>
      <DealTimer/>
      {/* <Banner/> */}

    </>
  )
}

export default Home