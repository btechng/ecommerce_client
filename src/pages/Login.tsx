import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/auth/login",
        { email, password }
      );

      const { token, role, name } = res.data;

      // Save token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", name);

      // Fetch and sync backend cart
      const cartRes = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const syncedCart = cartRes.data.map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(syncedCart));

      alert("Login successful!");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        className="w-full border p-2 mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
