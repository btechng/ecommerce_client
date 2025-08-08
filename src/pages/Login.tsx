import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/auth/login",
        { email, password }
      );

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("username", user.name);
      localStorage.setItem("role", user.role);

      const cartRes = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const syncedCart = cartRes.data.map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
      }));

      localStorage.setItem("cart", JSON.stringify(syncedCart));

      alert("✅ Login successful!");
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "❌ Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-10">
      {/* Login Card */}
      <div className="p-6 border rounded shadow bg-white relative">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            className="w-full border p-2 pr-10 rounded"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-600"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Logging in, wait a sec..." : "Login"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up Here and Enjoy All Benefit
          </button>
        </div>
      </div>

      {/* Overlay when loading */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded">
          <Loader2 className="animate-spin text-white" size={32} />
        </div>
      )}
    </div>
  );
};

export default Login;
