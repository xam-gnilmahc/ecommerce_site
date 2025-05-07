import React , {useState} from "react";
import mmmm from "../components/assets/mmmm.jpg";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Model } from "../pages/Model";
import "./Main.css";
const Home = () => {

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const [tshirtColor, setTshirtColor] = useState("red");

  const changeColor = (color) => {
    setTshirtColor(color);
  };

  return (
    <>
        <div className="heroMain">
        <div className="sectionleft">
         
          <div className=" d-flex flex-column align-items-center justify-content-center text-center">
            <p>New Season Arrivals</p>
            <span className="mb-4">
              Discover our latest collection and best deals of the season.
            </span>
            <div className="heroLink">
            <Link to="/product" onClick={scrollToTop}>
              <h5>Discover More</h5>
            </Link>
            </div>
        </div>
        </div>
        <div className="sectionright">
          <Canvas
            className="canvasModel"
            camera={{ position: [0, 5, 15], fov: 50 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={2.5}
              color={"white"}
            />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />

            <Model color={tshirtColor} />
          </Canvas>
          <div className="heroColorBtn">
            <button
              onClick={() => changeColor("#353933")}
              style={{ backgroundColor: "#353933" }}
            ></button>
            <button
              onClick={() => changeColor("#EFBD4E")}
              style={{ backgroundColor: "#EFBD4E" }}
            ></button>
            <button
              onClick={() => changeColor("#726DE7")}
              style={{ backgroundColor: "#726DE7" }}
            ></button>
            <button
              onClick={() => changeColor("red")}
              style={{ backgroundColor: "red" }}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
