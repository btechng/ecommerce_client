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
      console.log("Fetched Requests:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      toast.error("Failed to fetch requests");
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await axios.patch(
        `https://ecommerce-server-or19.onrender.com/api/admin/requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request status updated");
      fetchRequests();
    } catch (err) {
      console.error("Error updating request", err);
      toast.error("Failed to update request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>All Airtime/Data Requests</h2>
      <ToastContainer />

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
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
              <tr key={req._id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{req.type}</td>
                <td>{req.network}</td>
                <td>{req.phone}</td>
                <td>₦{req.amount}</td>
                <td>{req.status}</td>
                <td>{new Date(req.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => updateRequestStatus(req._id, "completed")}
                    disabled={req.status === "completed"}
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      marginRight: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req._id, "failed")}
                    disabled={req.status === "failed"}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRequests;
