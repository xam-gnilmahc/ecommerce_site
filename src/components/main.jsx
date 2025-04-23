import React from "react";

const Home = () => {
  return (
    <>
      <div className="hero  pb-3">
        <div className="card bg-dark border-0 m-3">
          <img
            src="./assets/mmmm.jpg"
            className="card-img img-fluid"
            alt="Hero Banner"
            style={{ width: "100%", height: "500px", objectFit: "cover" }}
          />
          <div className="card-img-overlay d-flex flex-column align-items-center justify-content-center text-center">
            <h1 className="display-4 fw-light text-white mb-3">New Season Arrivals</h1>
            <p className="lead text-white d-none d-md-block mb-4">
              Discover our latest collection and best deals of the season.
            </p>
            <a href="#products" className="btn btn-light btn-lg">Shop Now</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
