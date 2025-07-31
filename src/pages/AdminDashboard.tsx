import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ✅ Load products
  const fetchProducts = async () => {
    const res = await axios.get(
      "https://ecommerce-server-or19.onrender.com/api/products"
    );
    setProducts(res.data);
  };

  // ✅ Load users (requires admin token)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(products.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    setLoading(false);
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">🛠 Admin Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* ✅ Quick Actions */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <Link
            to="/admin/add-product"
            className="block text-blue-500 hover:underline mb-2"
          >
            ➕ Add Product
          </Link>
          <Link
            to="/admin/users"
            className="block text-blue-500 hover:underline"
          >
            👤 Manage Users
          </Link>
        </div>

        {/* ✅ Users Summary */}
        <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-2">
          <h3 className="font-semibold mb-2">📋 Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-gray-500 mt-2">No users found.</p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Product List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">🛍 Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-gray-700 mb-2">${product.price}</p>
              <button
                onClick={() => handleDelete(product._id)}
                className="text-red-600 text-sm"
              >
                ❌ Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
