import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Load categories on mount
  useEffect(() => {
    axios
      .get(
        "https://ecommerce-server-or19.onrender.com/api/products/categories/list"
      )
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // ✅ Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleAdd = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.category ||
      !form.stock ||
      !form.description
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const imageUrl =
      form.imageUrl ||
      `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(
        form.name
      )}`;

    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/products",
        {
          ...form,
          imageUrl: imageUrl,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Product added successfully");
      navigate("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "❌ Failed to add product");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <input
        name="name"
        className="w-full border p-2 mb-2"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="price"
        className="w-full border p-2 mb-2"
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={handleChange}
      />

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      >
        <option value="">Select Existing Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <p className="text-sm text-gray-600 mb-1">or add a new category below</p>
      <input
        name="category"
        className="w-full border p-2 mb-2"
        placeholder="Enter New Category"
        value={form.category}
        onChange={handleChange}
      />

      <input
        name="description"
        className="w-full border p-2 mb-2"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="stock"
        className="w-full border p-2 mb-2"
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={handleChange}
      />
      <input
        name="imageUrl"
        className="w-full border p-2 mb-4"
        placeholder="Image URL (optional)"
        value={form.imageUrl}
        onChange={handleChange}
      />

      {/* ✅ Live preview */}
      {form.name && (
        <div className="border rounded p-4 mb-4 bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Preview</h3>
          <img
            src={
              form.imageUrl ||
              `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(
                form.name
              )}`
            }
            alt="Preview"
            className="w-full h-48 object-cover mb-2"
          />
          <p>
            <strong>Name:</strong> {form.name}
          </p>
          <p>
            <strong>Price:</strong> ₦{form.price}
          </p>
          <p>
            <strong>Category:</strong> {form.category}
          </p>
          <p>
            <strong>Description:</strong> {form.description}
          </p>
          <p>
            <strong>Stock:</strong> {form.stock}
          </p>
        </div>
      )}

      <button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProduct;
