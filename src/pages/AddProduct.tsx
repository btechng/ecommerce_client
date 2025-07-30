import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const CLOUDINARY_UPLOAD_PRESET = "btechngecommerce";
const CLOUDINARY_CLOUD_NAME = "dkjvfszog";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(
        "https://ecommerce-server-or19.onrender.com/api/products/categories/list"
      )
      .then((res) => {
        const existing = res.data || [];
        const updatedCategories = existing.includes("Job/Vacancy")
          ? existing
          : [...existing, "Job/Vacancy"];
        setCategories(updatedCategories);

        const typeParam = searchParams.get("type");
        if (typeParam === "job") {
          setCategory("Job/Vacancy");
        }
      })
      .catch(() => console.warn("Failed to load categories"));
  }, []);

  const handleUploadImage = async (): Promise<string> => {
    if (!imageFile) return "";
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
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (
      !name ||
      !category ||
      !description ||
      !location ||
      (category === "Job/Vacancy" && !email)
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (category !== "Job/Vacancy" && !price) {
      alert("Please enter a price");
      return;
    }

    const imageUrl =
      category !== "Job/Vacancy" ? await handleUploadImage() : "";

    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/products",
        {
          name,
          price: category !== "Job/Vacancy" ? parseFloat(price) : 0,
          description,
          category,
          imageUrl,
          location,
          email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(category === "Job/Vacancy" ? "Job posted!" : "Product added!");
      navigate("/admin");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {category === "Job/Vacancy" ? "Post Job/Vacancy" : "Add New Product"}
      </h2>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Product or Job Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {category !== "Job/Vacancy" && (
        <input
          className="w-full border p-2 mb-3"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      )}

      <textarea
        className="w-full border p-2 mb-3"
        placeholder={
          category === "Job/Vacancy"
            ? "Duties / Responsibilities"
            : "Product Description"
        }
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

      {category === "Job/Vacancy" ? (
        <input
          className="w-full border p-2 mb-3"
          placeholder="Contact Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      ) : (
        <input
          className="w-full border p-2 mb-3"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      )}

      <button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white py-2 rounded"
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : category === "Job/Vacancy"
          ? "Post Job"
          : "Add Product"}
      </button>
    </div>
  );
}
