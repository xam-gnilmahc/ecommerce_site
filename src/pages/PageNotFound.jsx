import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div
        className="container-fluid d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "80vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center px-4">
          <h1
            style={{
              fontSize: "96px",
              fontWeight: "700",
              color: "#343a40",
              marginBottom: "20px",
            }}
          >
            404
          </h1>
          <h2 style={{ fontWeight: "500", color: "#495057" }}>
            Page Not Found
          </h2>
          <p className="mt-3" style={{ color: "#6c757d", maxWidth: "500px" }}>
            Sorry, the page you're looking for doesn’t exist or may have been
            moved. Please check the URL or return to the homepage.
          </p>
          <Link
            to="/"
            className="btn btn-outline-dark mt-4 px-4 py-2"
            style={{ borderRadius: "30px" }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
