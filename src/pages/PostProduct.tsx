import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CLOUDINARY_UPLOAD_PRESET = "btechngecommerce";
const CLOUDINARY_CLOUD_NAME = "dkjvfszog";

const PostProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    location: "",
    phoneNumber: "",
    email: "",
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      toast.warning("Please login to post a product.");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.imageUrl) {
      toast.error("Please upload an image.");
      return;
    }

    try {
      setLoading(true);
      console.log("📦 Submitting form:", form); // log form data
      const response = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/products/post",
        {
          ...form,
          price: Number(form.price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Product submitted:", response.data);
      toast.success("Product submitted! Waiting for admin approval.");
      navigate("/");
    } catch (err: any) {
      console.error("❌ Submit error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pt-24">
      <h2 className="text-2xl font-bold mb-4">📤 Post a Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          className="w-full border p-2"
          value={form.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2"
          rows={4}
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price (₦)"
          className="w-full border p-2"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full border p-2"
        />
        {uploading && (
          <p className="text-sm text-gray-500">Uploading image...</p>
        )}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded"
          />
        )}

        <input
          type="text"
          name="category"
          placeholder="Category (e.g. Electronics, job/vacancy)"
          className="w-full border p-2"
          value={form.category}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location (optional)"
          className="w-full border p-2"
          value={form.location}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          className="w-full border p-2"
          value={form.phoneNumber}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2"
          value={form.email}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          disabled={loading || uploading}
        >
          {loading ? "Submitting..." : "Submit Product"}
        </button>
      </form>
    </div>
  );
};

export default PostProduct;
