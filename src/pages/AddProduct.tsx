import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    imageUrl: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category || !form.stock) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/products",
        {
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Product added!");
      navigate("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "❌ Failed to add product");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      {error && <div className="text-red-500 mb-3">{error}</div>}

      <input
        name="name"
        className="w-full border p-2 mb-2"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="price"
        type="number"
        className="w-full border p-2 mb-2"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
      />

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        name="description"
        className="w-full border p-2 mb-2"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="stock"
        type="number"
        className="w-full border p-2 mb-2"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
      />
      <input
        name="imageUrl"
        className="w-full border p-2 mb-4"
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={handleChange}
      />

      <button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProduct;
