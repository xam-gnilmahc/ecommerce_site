import React, { useEffect, useState ,useRef} from "react";
import { useParams, useNavigate} from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiArrowLeft } from "react-icons/fi";
import "./orderDetails.css";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";
import Modal from "react-modal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails,user,loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
const [refundReason, setRefundReason] = useState("");
const [error, setError] = useState("");
const [selectedReason, setSelectedReason] = useState("");
const predefinedReasons = [
  "Wrong item delivered",
  "Item damaged",
  "Late delivery",
  "Changed my mind",
  "Other",
];
const [modalIsOpen, setModalIsOpen] = useState(false);
const [pdfUrl, setPdfUrl] = useState(null);
const designRef = useRef();


const handlePrint = () => {
  const printContents = designRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload()
};


  useEffect(() => {
    (async () => setOrder(await getOrderDetails(orderId)))();
    console.log(order);
  }, [orderId])
  
  const steps = ["Pending","Confirmed", "Shipped Out", "Out for Delivery", "Delivered"];
  const currentIdx = steps.findIndex(
    (s) => s.toLowerCase() === order?.status?.toLowerCase()
  );

  const payColor = (s) =>
    s === "success" ? "success" : s === "pending" ? "warning" : "danger";

  const formatDate = (value) => {
    if (!value) return "N/A";
    const fixed = value.replace(" ", "T");
    const date = new Date(fixed);
    if (isNaN(date)) return "Invalid date";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = () => {
    if (!refundReason) {
      alert("Please provide a reason for refund.");
      return;
    }
    alert(`Refund reason submitted: ${refundReason}`);

    // Reset form and close modal
    setSelectedReason("");
    setRefundReason("");
    
  };

  return (
    <>

     <div className="d-flex">
          <Sidebar />
          <main className="flex-grow-1 p-3" style={{ marginLeft: "280px" }}>
      <div ref={designRef}>
        {/* Header with Back Arrow and Order ID */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-3">
  {/* Left side - Heading and Breadcrumb */}
  <div>
    <h2 className="order-id m-0">
      Orders Details # <span>{order?.id}</span>
    </h2>
    <small className="text-muted d-block mt-1">
      Dashboard / Order Details
    </small>
  </div>

  {/* Right side - Buttons */}
  <div className="d-flex flex-wrap gap-2">
    <button
      type="button"
      className="btn"
      data-toggle="modal"
      data-target="#exampleModal"
      style={{ backgroundColor: "#333", color: "#fff" }}
    >
      Cancel Order
    </button>

    <button
      className="btn btn-outline-secondary"
      onClick={handlePrint}
    >
      <i className="bi bi-receipt-cutoff me-2" />
      Invoice
    </button>

    <button
      className="btn"
      style={{ backgroundColor: "#333", color: "#fff" }}
      onClick={() => navigate(`/track/${order.id}`)}
    >
      <i className="bi bi-truck me-2" />
      Track
    </button>
  </div>
</div>

<hr/>


        {/* Header Buttons */}
        
  {loading || !order ? ( 
    <LottieLoader />
  ) : (
    <>

        {/* Dates */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
  <div>
    <p className="mb-1 text-secondary small">Order Date</p>
    <p className="mb-0 fw-semibold small">{formatDate(order.created_at)}</p>
  </div>
  <div>
    <p className="mb-1 text-secondary small">Delivery Date</p>
    <p className="mb-0 fw-semibold small">{formatDate(order.order_date)}</p>
  </div>
</div>



        {/* Progress Tracker */}
        <div className="progress-tracker mb-5">
          {steps.map((label, i) => {
            const isCurrent = i === currentIdx;
            const isCompleted = i < currentIdx;

            return (
              <div key={label} className="step-item position-relative">
                <div
                  className={`step-circle ${
                    isCompleted ? "completed" : ""
                  } ${isCurrent ? "current" : ""}`}
                >
                  {i + 1}
                </div>
                <div
                  className={`step-label ${
                    isCurrent
                      ? "current-label"
                      : isCompleted
                      ? "completed-label"
                      : ""
                  }`}
                >
                  {label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`position-absolute top-50 start-50 translate-middle-y border-bottom ${
                      i < currentIdx ? "border-info" : "border-muted"
                    }`}
                    style={{
                      width: "100%",
                      zIndex: -1,
                      left: "50%",
                      right: 0,
                      height: "8px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Items Table */}
        <h4 className="mb-4">Purchased Products</h4>
        <div className=" table-responsive overflow-x-auto rounded-lg  border rounded mb-5">
  <table className=" table-auto text-md text-gray-700">
    <thead className="bg-gray-100 text-left">
      <tr>
        <th className="p-4  text-dark font-semibold">Image</th>
        <th className="p-4  text-dark font-semibold"style={{ width: "800px" }}>Name</th>
        <th className="p-4  text-dark font-semibold" style={{ width: "400px" }}>Ordered Qty</th>
        <th className="p-4 text-dark font-semibold" style={{ width: "400px" }}>Price</th>
        <th className="p-4  text-dark font-semibold" style={{ width: "400px" }}>Total</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {order.order_items.map((it) => (
        <tr key={it.id} className="hover:bg-gray-50">
          <td className="p-4">
            <img
              src={
                it.products?.banner_url
                  ? `https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${it.products.banner_url}`
                  : "/no-image.png"
              }
              alt={it.products?.name}
              style={{ width: "80px", height: "60px", objectFit: "contain" }}
            />
          </td>
          <td className="p-4 font-medium">{it.products?.name}</td>
          <td className="p-4 ">{it.quantity}</td>
          <td className="p-4 ">${it.price_each.toFixed(2)}</td>
          <td className="p-4 ">
            ${(it.quantity * it.price_each).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>



        {/* Payment & Summary & Address */}
        <div className="row g-4">
  {/* Payment */}
  <div className="col-12 col-sm-4">
  <div
    className="p-4 rounded "
    style={{
      border: "1px solid #e2e8f0",
      backgroundColor: "#fff",
      minHeight: "250px",
    }}
  >
    {/* Header */}
    <h5 className="mb-4" style={{ fontWeight: "700", color: "#2d3748" }}>
      Payment Summary
    </h5>


    {/* Payment Status Badge */}
    {/* <div style={{ maxWidth: "140px" }}>
      <span
        className={`badge bg-${payColor(order.payment_status)} fs-6 w-100 text-uppercase`}
        style={{
          fontWeight: "600",
          padding: "0.55rem 0.75rem",
          borderRadius: "16px",
          letterSpacing: "0.5px",
        }}
      >
        {order.payment_status}
      </span>
    </div> */}

    {/* Payment Details */}
    {order.orderpayments_logs?.length > 0 ? (
      <div className="small" style={{ color: "#4a5568" }}>
        <div className="mb-2">
          <strong>Amount:</strong> ${order.orderpayments_logs[0].amount.toFixed(2)}{" "}
          <strong>{order.orderpayments_logs[0].currency}</strong>
        </div>
        <div className="mb-2">
          <strong>Transcation Id:</strong> {order.orderpayments_logs[0].stripe_payment_id}
        </div>
        <div className="">
          <strong>Status:</strong> {order.orderpayments_logs[0].status}
        </div>
        <div style={{ fontStyle: "italic", color: "#718096" }}>
          Paid via Stripe card
        </div>
      </div>
    ) : (
      <div className="mt-4 text-muted small">No payment records found.</div>
    )}
  </div>
</div>
  {/* Order Summary */}
  <div className="col-12 col-sm-4">
    <div
      className="p-4 rounded"
      style={{
        border: "1px solid #e2e8f0",
        minHeight: "250px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <h5 className="mb-3" style={{ fontWeight: "700", color: "#333" }}>
        Order Summary
      </h5>
      <div>
        <div
          className="summary-row d-flex justify-content-between mb-2"
          style={{ fontWeight: "600" }}
        >
          <span>Subtotal</span>
          <span>${(order.total_amount - 30).toFixed(2)}</span>
        </div>
        <div
          className="summary-row d-flex justify-content-between mb-2"
          style={{ fontWeight: "600" }}
        >
          <span>Shipping</span>
          <span>$30.00</span>
        </div>
        <hr style={{ borderColor: "#d1d5db" }} />
        <div
          className="summary-row total d-flex justify-content-between"
          style={{ fontWeight: "700", fontSize: "1.15rem" }}
        >
          <span>Total</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Shipping Address */}
  <div className="col-12 col-sm-4">
    <div
      className="p-4 rounded"
      style={{
        border: "1px solid #e2e8f0",
        minHeight: "250px",
        color: "#444",
        fontWeight: "500",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "0.5rem",
      }}
    >
      <h5 className="mb-3" style={{ fontWeight: "700", color: "#333" }}>
        Shipping Address
      </h5>

      <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>Name</p>
      <p style={{ marginTop: 0 }}>{user.name}</p>

      <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>Address</p>
      {(() => {
        let addr;
        try {
          addr = JSON.parse(order.shipping_address);
        } catch {
          addr = null;
        }
        return addr ? (
          <p style={{ marginTop: 0 }}>
            {addr.addressLine1}, {addr.state}, {addr.zipCode}, {addr.country}
          </p>
        ) : (
          <small className="text-muted">No address available.</small>
        );
      })()}
    </div>
  </div>
  <div
      className="modal fade"
      id="exampleModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-light border-bottom-0">
            <h5 className="modal-title fw-bold" id="exampleModalLabel">
              Cancel Order
            </h5>
            <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close"
             onClick={() => {
                setSelectedReason("");
                setRefundReason("");
              }}></button>
          </div>

          <div className="modal-body py-2 px-3">

          {selectedReason !== "Other" && (
  <div className="mb-3">
    <label className="form-label fw-semibold">
      Reason <span className="text-danger">*</span>
    </label>
    <select
      className="form-select"
      value={selectedReason}
      onChange={(e) => {
        const reason = e.target.value;
        setSelectedReason(reason);

        if (reason !== "Other") {
          setRefundReason(reason);
        } else {
          setRefundReason(""); // clear for custom input
        }
      }}
    >
      <option value="">Select a reason</option>
      {predefinedReasons.map((reason, idx) => (
        <option key={idx} value={reason}>
          {reason}
        </option>
      ))}
    </select>
  </div>
)}

{selectedReason === "Other" && (
  <div className="mb-3 animate__animated animate__fadeIn">
    <label className="form-label fw-semibold">
      Enter Custom Reason <span className="text-danger">*</span>
    </label>
    <textarea
      className="form-control"
      rows="3"
      value={refundReason}
      onChange={(e) => setRefundReason(e.target.value)}
      placeholder="Please describe the reason"
    />
  </div>
)}

          </div>

          <div className="modal-footer bg-light border-top-0 px-4 py-3">
            <button type="button" className="btn btn-outline-secondary" data-dismiss="modal"
             onClick={() => {
                setSelectedReason("");
                setRefundReason("");
              }}>
              Cancel
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
</div>
</>
  )}

      </div>
      <div className="modal fade" id="pdfModal" tabIndex="-1" role="dialog" aria-labelledby="pdfModal" aria-hidden="true">
  <div className="modal-dialog modal-xl" role="document">
    <div className="modal-content">

      <div className="modal-header">
        <h2 className="modal-title">PDF Preview</h2>
        <button type="button" className="close" data-dismiss="modal">&times;</button>
      </div>

      <div className="modal-body" style={{ padding: 0, height: '80vh' }}>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            style={{ height: '100%', border: 'none' }}
            title="PDF Preview"
          />
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">
          Close
        </button>
      </div>

    </div>
  </div>
</div>



      </main>
      </div>
    </>
  );
};

export default OrderDetailsPage;
