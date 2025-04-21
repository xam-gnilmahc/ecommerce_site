import React from "react";

const Home = () => {
  return (
    <>
      <div className="hero border-1 pb-3">
        <div className="card bg-dark border-0 mx-3">
          <img
            className="card-img img-fluid"
            src="./assets/mmmm.jpg"
            alt="Card"
            style={{ height: "500px", objectFit: "cover" }}
          />
          <div className="card-img-overlay d-flex align-items-center">
            {/* <div className="container">
              <h5 className="card-title fs-1 fw-lighter text-black font-weight-semibold">New Season Arrivals</h5>
              <p className="card-text fs-5 d-none d-sm-block text-black font-weight-semibold">
                This is a wider card with supporting text below as a natural
                lead-in to additional content. This content is a little bit
                longer.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
