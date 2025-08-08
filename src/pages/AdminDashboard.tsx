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
  isApproved: boolean; // ✅ Add this line
  approvalDate?: string; // optional, for approved products
  // any other fields like category, description, etc.
}

interface Request {
  _id: string;
  type: string;
  network: string;
  phone: string;
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

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-server-or19.onrender.com/api/products/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched pending products:", res.data); // ✅
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch pending products", err);
      }
    };

    fetchPendingProducts();
  }, []);
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

    fetchUsers();
  }, []);

  // Approve/Reject request
  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await axios.patch(
        `https://ecommerce-server-or19.onrender.com/api/requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request status updated");
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
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
          <input className="border p-2 rounded w-full md:w-1/3" />
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
        {products.filter((p) => p.isApproved === false).length === 0 ? (
          <p>No pending products.</p>
        ) : (
          <div className="overflow-x-auto">
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
                  .filter((p) => p.isApproved === false)
                  .map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
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
          </div>
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
