import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface RequestItem {
  _id: string;
  user: { name: string; email: string };
  network: string;
  phone: string;
  plan: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function AdminDataRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const apiBase = "https://ecommerce-server-or19.onrender.com";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/wallet/data-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      toast.error("❌ Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(
        `${apiBase}/api/wallet/data-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Status updated");
      fetchRequests(); // refresh
    } catch (err) {
      toast.error("❌ Failed to update status");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📡 Data Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Network</th>
                <th className="p-2 border">Plan</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td className="p-2 border">
                    <p>{req.user?.name}</p>
                    <p className="text-xs text-gray-500">{req.user?.email}</p>
                  </td>
                  <td className="p-2 border">{req.phone}</td>
                  <td className="p-2 border">{req.network}</td>
                  <td className="p-2 border">{req.plan}</td>
                  <td className="p-2 border">₦{req.price}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        req.status === "completed"
                          ? "bg-green-600"
                          : req.status === "failed"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border space-x-1">
                    <button
                      onClick={() => updateStatus(req._id, "completed")}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(req._id, "failed")}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Fail
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No data requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
