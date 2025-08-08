import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Request {
  _id: string;
  type: string;
  network: string;
  phone: string;
  amount: number;
  status: string;
  createdAt: string;
}

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/wallet/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(res.data);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      toast.error("Failed to fetch requests");
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await axios.patch(
        `https://ecommerce-server-or19.onrender.com/api/wallet/requests/${requestId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(`Request marked as ${status}`);
      fetchRequests();
    } catch (err) {
      console.error("❌ Error updating request:", err);
      toast.error("Failed to update request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "4px 10px",
          borderRadius: "8px",
        };
      case "failed":
        return {
          backgroundColor: "#f44336",
          color: "white",
          padding: "4px 10px",
          borderRadius: "8px",
        };
      default:
        return {
          backgroundColor: "#ff9800",
          color: "white",
          padding: "4px 10px",
          borderRadius: "8px",
        };
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>All Airtime</h2>
      <ToastContainer />

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Network</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td data-label="Type">{req.type}</td>
                  <td data-label="Network">{req.network}</td>
                  <td data-label="Phone">{req.phone}</td>
                  <td data-label="Amount">₦{req.amount}</td>
                  <td data-label="Status">
                    <span style={getStatusStyle(req.status)}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td data-label="Date">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                  <td data-label="Actions">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateRequestStatus(req._id, "completed")
                          }
                          className="approve-btn"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req._id, "failed")}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>
        {`
        .table-container {
          width: 100%;
          overflow-x: auto;
        }
        .responsive-table {
          width: 100%;
          border-collapse: collapse;
        }
        .responsive-table th,
        .responsive-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .approve-btn {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 6px 12px;
          margin-right: 5px;
          cursor: pointer;
          border-radius: 5px;
        }
        .reject-btn {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 5px;
        }
        
        /* Mobile view: turn table into cards */
        @media (max-width: 768px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table,
          .responsive-table tbody,
          .responsive-table tr,
          .responsive-table td {
            display: block;
            width: 100%;
          }
          .responsive-table tr {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          }
          .responsive-table td {
            text-align: right;
            padding-left: 50%;
            position: relative;
          }
          .responsive-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            width: 45%;
            font-weight: bold;
            text-align: left;
          }
          .approve-btn, .reject-btn {
            width: 100%;
            margin: 5px 0;
          }
        }
        `}
      </style>
    </div>
  );
};

export default AdminRequests;
