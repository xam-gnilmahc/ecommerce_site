import React from "react";

const Home = () => {
  return (
    <>
      <div className="hero pb-3">
      <div className="py-4">
          <div className="container">
         
            <div className="row justify-content-center g-3">
      
              <div className="col-12 col-sm-auto">
                <div className="position-relative" style={{ width: '180px' }}>
                  <select
                    className="form-select pe-5 py-2"
                    style={{
                      backgroundColor: 'rgba(231, 244, 243, 0.89)',
                      border: 'none',
                      borderRadius: '20px',
                      appearance: 'none',
                      color:'rgba(72, 83, 82, 0.89)'
                    }}
                  >
                    <option value="">Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home</option>
                  </select>
                  <div
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <i className="fa fa-chevron-down" style={{ fontSize: '12px' , color:'rgba(72, 83, 82, 0.89)'}}></i>
                  </div>
                </div>
              </div>

          
              <div className="col-12 col-sm-auto">
                <div className="position-relative" style={{ width: '180px' }}>
                  <select
                    className="form-select pe-5 py-2"
                    style={{
                      backgroundColor: 'rgba(231, 244, 243, 0.89)',
                      border: 'none',
                      borderRadius: '20px',
                      appearance: 'none',
                      color:'rgba(72, 83, 82, 0.89)'
                    }}
                  >
                    <option value="">Brand</option>
                    <option value="apple">Apple</option>
                    <option value="samsung">Samsung</option>
                    <option value="nike">Nike</option>
                  </select>
                  <div
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <i className="fa fa-chevron-down" style={{ fontSize: '12px', color:'rgba(72, 83, 82, 0.89)' }}></i>
                  </div>
                </div>
              </div>

           
              <div className="col-12 col-sm-auto">
                <div className="position-relative" style={{ width: '250px' }}>
                  <input
                    type="text"
                    className="form-control ps-3 pe-5 py-2"
                    placeholder="Search..."
                    style={{
                      border: 'none',
                      backgroundColor: 'rgba(231, 244, 243, 0.89)',
                      borderRadius: '20px',
                    }}
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fa fa-search text-dark" style={{ color:'rgba(72, 83, 82, 0.89)' }}></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
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
