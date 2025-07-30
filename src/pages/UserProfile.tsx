import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
}

export default function UserProfile() {
  const [userName, setUserName] = useState("User");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    if (storedName) {
      setUserName(storedName);
      setNewName(storedName);
    }
    if (storedEmail) {
      setEmail(storedEmail);
      setNewEmail(storedEmail);
    }

    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(viewed);
  }, []);

  const handleSaveProfile = async () => {
    setUserName(newName);
    setEmail(newEmail);
    localStorage.setItem("username", newName);
    localStorage.setItem("email", newEmail);

    // Optional: update to backend
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      try {
        await axios.put(
          `https://ecommerce-server-or19.onrender.com/api/users/${userId}`,
          { name: newName, email: newEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Profile updated!");
      } catch {
        alert("Failed to update profile on server.");
      }
    }

    setEditing(false);
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      try {
        await axios.put(
          `https://ecommerce-server-or19.onrender.com/api/users/${userId}`,
          { password: newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Password updated successfully.");
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } catch {
        alert("Failed to update password.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        {!editing ? (
          <div>
            <p className="mb-2 text-lg">👤 Name: {userName}</p>
            <p className="mb-4 text-lg">📧 Email: {email}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 underline"
            >
              ✏️ Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              className="border p-2 w-full rounded"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="email"
              className="border p-2 w-full rounded"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔐 Change Password</h2>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 w-full rounded"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 w-full rounded"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />
          <button
            onClick={handleChangePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">🕵️ Recently Viewed</h2>
        {recentlyViewed.length === 0 ? (
          <p className="text-gray-500">You haven't viewed any items yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentlyViewed.map((item) => (
              <Link to={`/product/${item._id}`} key={item._id}>
                <div className="border rounded-xl p-3 bg-white shadow hover:shadow-md transition">
                  {item.imageUrl &&
                    !item.category?.toLowerCase().includes("job") && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-32 w-full object-cover rounded mb-2"
                      />
                    )}
                  <h3 className="text-md font-semibold truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
