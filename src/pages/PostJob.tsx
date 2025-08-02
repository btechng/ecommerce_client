import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [duties, setDuties] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warning("You must be logged in to post a job.");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location || !duties || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/products/post",
        {
          name: title,
          description: duties,
          price: 0,
          imageUrl: "https://via.placeholder.com/300", // Default image
          category: "Job/Vacancy",
          location,
          phoneNumber: "",
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("🎉 Job posted successfully!");
      navigate("/jobs"); // ✅ redirect to jobs page
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Failed to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          📢 Post a Job / Vacancy
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Duties / Job Description
            </label>
            <textarea
              value={duties}
              onChange={(e) => setDuties(e.target.value)}
              className="w-full border p-2 rounded min-h-[100px]"
              required
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Posting..." : "🚀 Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
