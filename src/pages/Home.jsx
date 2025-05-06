import { Navbar, Main, Product, Footer} from "../components";
import Filters from "../components/Filter";
import HeroSection from "./HeroSection";

function Home() {
  return (
    <>
      <Navbar />
      {/* <HeroSection/> */}
      <Main/>
    
      <Product />
      <Footer />
    </>
  )
}

export default Home