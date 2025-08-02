import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
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
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
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
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
