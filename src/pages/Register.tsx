// src/pages/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { socialApi } from "../api/socialBlogApi";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("❌ Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Register on TasknCart
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/auth/signup",
        { name, email, password }
      );

      const user = res.data;

      // 2️⃣ Automatically create Social Blog account
      const sbRes = await socialApi
        .post("/auth/register", { username: name, email, password })
        .catch(async (err) => {
          // If user already exists, just login
          const loginRes = await socialApi.post("/auth/login", {
            email,
            password,
          });
          return loginRes;
        });

      const { token: socialToken } = sbRes.data;
      localStorage.setItem("socialToken", socialToken);

      alert("✅ Registered successfully!");
      navigate("/login");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-16">
      <div className="p-6 border rounded-lg shadow-lg bg-white relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-sm mb-4 text-center">
            {errorMessage}
          </div>
        )}

        <input
          className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            className="w-full border p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative mb-6">
          <input
            className="w-full border p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Registering..." : "Register"}
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      )}
    </div>
  );
};

export default Register;
