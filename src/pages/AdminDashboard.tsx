import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  status: string;
}

interface Request {
  _id: string;
  type: string;
  network: string;
  phoneNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
  walletBalance: number;
}

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const [balance, setBalance] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/admin/balance"
      );
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Error fetching balance", err);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/products"
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/requests"
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/users"
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchProducts();
    fetchRequests();
    fetchUsers();
  }, []);

  // Approve/Reject request
  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await axios.put(
        `https://ecommerce-server-or19.onrender.com/api/requests/${requestId}/status`,
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

  // Approve product
  const updateProductStatus = async (productId: string, status: string) => {
    try {
      await axios.put(
        `https://ecommerce-server-or19.onrender.com/api/products/${productId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Product approved");
      fetchProducts();
    } catch (err) {
      console.error("Error updating product", err);
      toast.error("Failed to update product");
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    try {
      await axios.delete(
        `https://ecommerce-server-or19.onrender.com/api/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product", err);
      toast.error("Failed to delete product");
    }
  };

  // Manual fund
  const handleManualFund = async () => {
    if (!email || !amount) {
      toast.error("Email and amount are required");
      return;
    }

    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/wallet/manual-credit",
        { email, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Wallet funded successfully");
      setEmail("");
      setAmount("");
      fetchUsers();
    } catch (err) {
      console.error("Error funding wallet", err);
      toast.error("Failed to fund wallet");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Platform Balance */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Platform Balance</h2>
        <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
      </div>

      {/* Manual Wallet Funding */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Fund User Wallet</h2>
        <div className="flex gap-4 items-center">
          <input
            type="email"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <button
            onClick={handleManualFund}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Fund Wallet
          </button>
        </div>
      </div>

      {/* Pending Products Approval */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-2xl font-bold mb-4">
          Pending Products for Approval
        </h2>
        {products.filter((p) => p.status === "pending").length === 0 ? (
          <p>No pending products.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) => p.status === "pending")
                .map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded"
                      />
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">₦{product.price}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() =>
                          updateProductStatus(product._id, "approved")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Airtime/Data Requests */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-2xl font-bold mb-4">Airtime & Data Requests</h2>
        {requests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Network</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td className="px-4 py-2">{req.type}</td>
                  <td className="px-4 py-2">{req.network}</td>
                  <td className="px-4 py-2">{req.phoneNumber}</td>
                  <td className="px-4 py-2">₦{req.amount}</td>
                  <td className="px-4 py-2">{req.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => updateRequestStatus(req._id, "approved")}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(req._id, "rejected")}
                      className="bg-red-500 text-white px-2 py-1 rounded"
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

      {/* Users Table */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        {users.length === 0 ? (
          <p>No users yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Wallet Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">₦{user.walletBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
