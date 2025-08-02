import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("❌ Mismatched passwords");
      return;
    }

    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/auth/signup",
        { name, email, password }
      );
      alert("✅ Registered successfully");
      navigate("/login");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "❌ Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

      {errorMessage && (
        <div className="text-red-600 text-sm mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative mb-3">
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

      <div className="relative mb-4">
        <input
          className="w-full border p-2 pr-10 rounded"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Register
      </button>
    </div>
  );
};

export default Register;
