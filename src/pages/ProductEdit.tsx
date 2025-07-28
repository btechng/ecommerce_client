import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CLOUDINARY_UPLOAD_PRESET = "btechngecommerce";
const CLOUDINARY_CLOUD_NAME = "dkjvfszog";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios
      .get(`https://ecommerce-server-or19.onrender.com/api/products/${id}`)
      .then((res) => {
        const p = res.data;
        setName(p.name);
        setPrice(p.price);
        setDescription(p.description || "");
        setCategory(p.category || "");
        setLocation(p.location || "");
        setPhoneNumber(p.phoneNumber || "");
        setImageUrl(p.imageUrl || "");
      });

    axios
      .get(
        "https://ecommerce-server-or19.onrender.com/api/products/categories/list"
      )
      .then((res) => setCategories(res.data));
  }, [id]);

  const handleUploadImage = async (): Promise<string> => {
    if (!imageFile) return imageUrl;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    setUploading(true);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch {
      alert("Image upload failed");
      return imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    const newImageUrl = await handleUploadImage();
    try {
      await axios.put(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}`,
        {
          name,
          price: parseFloat(price),
          description,
          category,
          imageUrl: newImageUrl,
          location,
          phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Product updated!");
      navigate("/admin");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update product");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3"
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <textarea
        className="w-full border p-2 mb-3"
        placeholder="Product Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="w-full border p-2 mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <input
        className="w-full border p-2 mb-3"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-3"
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 text-white py-2 rounded"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Update Product"}
      </button>
    </div>
  );
}
