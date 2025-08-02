import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  price: number;
  isApproved: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Category {
  _id: string;
  name: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/products/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);
    } catch {
      alert("Failed to fetch products");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch {
      console.error("Failed to load users");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/categories"
      );
      setCategories(res.data);
    } catch {
      console.error("Failed to load categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Category name required");
    try {
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories((prev) => [res.data, ...prev]);
      setNewCategory("");
    } catch (err) {
      alert("Failed to add category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(
        `https://ecommerce-server-or19.onrender.com/api/products/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isApproved: true } : p))
      );
      alert("✅ Product approved");
    } catch {
      alert("❌ Approval failed");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchCategories();
    setLoading(false);
  }, []);

  const filteredProducts =
    filter === "pending" ? products.filter((p) => !p.isApproved) : products;

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">🛠 Admin Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
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

      {/* Add Category */}
      <div className="bg-white mt-6 p-4 rounded shadow max-w-md mx-auto">
        <h3 className="font-semibold mb-2">📂 Add New Category</h3>
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Electronics"
            className="border p-2 w-full"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-3 text-sm text-gray-700">
          {categories.map((c) => (
            <li key={c._id}>• {c.name}</li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div className="mt-6 mb-2 flex gap-4 justify-center">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1 rounded ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-1 rounded ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-300"
          }`}
        >
          Pending Approval
        </button>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white p-4 rounded shadow w-full overflow-hidden"
          >
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-gray-700 mb-2">
              ₦{product.price?.toLocaleString()}
            </p>

            {product.isApproved ? (
              <span className="text-green-600 text-sm mb-2 block">
                ✔️ Approved
              </span>
            ) : (
              <button
                onClick={() => handleApprove(product._id)}
                className="text-blue-600 text-sm mb-2 block"
              >
                ✅ Approve
              </button>
            )}

            <button
              onClick={() => handleDelete(product._id)}
              className="text-red-600 text-sm"
            >
              ❌ Delete
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No products to display.
        </p>
      )}
    </div>
  );
};

export default AdminDashboard;
