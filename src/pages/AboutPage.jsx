import React from 'react';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import TabletIcon from '@mui/icons-material/Tablet';
import WatchIcon from '@mui/icons-material/Watch';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DevicesIcon from '@mui/icons-material/Devices';

const categories = [
  {
    title: "Mobile Phones",
    icon: <PhoneIphoneIcon fontSize="large" style={{ color: '#3f51b5' }} />,
    image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Laptops",
    icon: <LaptopMacIcon fontSize="large" style={{ color: '#673ab7' }} />,
    image: "https://images.pexels.com/photos/4592256/pexels-photo-4592256.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Tablets",
    icon: <TabletIcon fontSize="large" style={{ color: '#f44336' }} />,
    image: "https://images.pexels.com/photos/5904931/pexels-photo-5904931.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Watches",
    icon: <WatchIcon fontSize="large" style={{ color: '#ff9800' }} />,
    image: "https://images.pexels.com/photos/1200491/pexels-photo-1200491.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    title: "Tech Brands",
    icon: <StorefrontIcon fontSize="large" style={{ color: '#009688' }} />,
    image: "https://images.pexels.com/photos/3606228/pexels-photo-3606228.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const AboutPage = () => {
  return (
    <>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold display-6">About Our Brand</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "750px" }}>
            We specialize in offering top-tier technology, including mobile phones, laptops, tablets, and watches from the best tech brands in the world.
          </p>
        </div>

        <div className="row justify-content-center">
          {categories.map((cat, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="card-img-top"
                  style={{
                    height: "180px",
                    objectFit: "cover",
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem',
                  }}
                />
                <div className="card-body text-center">
                  <div className="mb-2">{cat.icon}</div>
                  <h6 className="fw-semibold">{cat.title}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AboutPage;
