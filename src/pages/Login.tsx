// src/pages/Login.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { socialApi } from "../api/socialBlogApi";

interface IUser {
  _id: string;
  name: string;
  role: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill in all fields");
    setLoading(true);

    try {
      // 1️⃣ Login to TasknCart
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
      const { token, user }: { token: string; user: IUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("username", user.name);
      localStorage.setItem("role", user.role);

      // 2️⃣ Fetch user's cart and store locally
      const cartRes = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/cart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const syncedCart = cartRes.data.map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(syncedCart));

      // 3️⃣ Login/register Social Blog account
      const sbRes = await socialApi
        .post("/auth/login", { email, password })
        .catch(async () => {
          // If not exist, register
          const registerRes = await socialApi.post("/auth/register", {
            username: user.name,
            email,
            password,
          });
          return registerRes;
        });

      const { token: socialToken } = sbRes.data;
      localStorage.setItem("socialToken", socialToken);

      alert("✅ Login successful!");
      navigate(user.role === "admin" ? "/admin" : "/social-blog");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-16">
      <div className="p-6 border rounded-lg shadow-lg bg-white relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

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

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-5">
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up Here and Enjoy All Benefits
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      )}
    </div>
  );
};

export default Login;
