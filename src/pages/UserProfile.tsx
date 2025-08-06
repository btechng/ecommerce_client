import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wallet, Eye } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [dataAmount, setDataAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [airtimeNetwork, setAirtimeNetwork] = useState("");
  const [airtimePhone, setAirtimePhone] = useState("");
  const [airtimeAmount, setAirtimeAmount] = useState(0);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const apiBase = "https://ecommerce-server-or19.onrender.com";

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

    const fetchBalance = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(res.data.balance || 0);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `${apiBase}/api/users/${userId}/transactions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };

    const fetchDataPlans = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/wallet/data-plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDataPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch data plans", err);
      }
    };

    if (token && userId) {
      const cachedBalance = localStorage.getItem("balance");
      if (cachedBalance) {
        setBalance(Number(cachedBalance));
        localStorage.removeItem("balance");
      } else {
        fetchBalance();
      }

      fetchTransactions();
      fetchDataPlans();
    }
  }, []);

  const handleFundWallet = async () => {
    try {
      const res = await axios.post(
        `${apiBase}/api/wallet/fund`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.data.authorization_url;
    } catch (err) {
      toast.error("❌ Error initiating payment");
    }
  };

  const confirmBuyData = async () => {
    if (dataAmount > balance) {
      toast.error("❌ Insufficient wallet balance");
      return;
    }
    try {
      await axios.post(
        `${apiBase}/api/wallet/buy-data`,
        { network, phone, plan, amount: dataAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Data purchase successful");
      setBalance((prev) => prev - dataAmount);
      setShowModal(false);
    } catch (err) {
      toast.error("❌ Data purchase failed");
    }
  };

  const confirmBuyAirtime = async () => {
    if (airtimeAmount > balance) {
      toast.error("❌ Insufficient wallet balance");
      return;
    }

    try {
      await axios.post(
        `${apiBase}/api/wallet/buy-airtime`,
        {
          network: airtimeNetwork,
          phone: airtimePhone,
          amount: airtimeAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Airtime purchase successful");
      setBalance((prev) => prev - airtimeAmount);
      setAirtimeAmount(0);
      setAirtimePhone("");
      setAirtimeNetwork("");
    } catch (err) {
      toast.error("❌ Airtime purchase failed");
    }
  };

  const handleBuyData = () => {
    const selected = dataPlans.find((p) => p.plan_id === plan);
    setSelectedPlanDetails(selected);
    setDataAmount(Number(selected?.price) || 0);
    setShowModal(true);
  };

  const tabs = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="w-4 h-4 mr-1" />,
    },
    {
      key: "wallet",
      label: "Wallet",
      icon: <Wallet className="w-4 h-4 mr-1" />,
    },
    { key: "viewed", label: "Viewed", icon: <Eye className="w-4 h-4 mr-1" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 pt-24">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <div className="flex space-x-4 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 transition-all duration-300 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 font-bold"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Tab */}
          {activeTab === "profile" && (
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
                      onClick={async () => {
                        try {
                          await axios.put(
                            `${apiBase}/api/users/${userId}`,
                            { name: newName, email: newEmail },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setUserName(newName);
                          setEmail(newEmail);
                          setEditing(false);
                          localStorage.setItem("username", newName);
                          localStorage.setItem("email", newEmail);
                          toast.success("✅ Profile updated");
                        } catch {
                          toast.error("❌ Failed to update profile");
                        }
                      }}
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

              <div className="mt-6 space-y-3">
                <h2 className="text-xl font-semibold mb-1">
                  🔐 Change Password
                </h2>
                <input
                  type="password"
                  placeholder="New Password"
                  className="border p-2 w-full rounded"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
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
                  onClick={async () => {
                    const { newPassword, confirmPassword } = passwordData;
                    if (newPassword !== confirmPassword) {
                      toast.error("❌ Passwords do not match");
                      return;
                    }
                    try {
                      await axios.put(
                        `${apiBase}/api/users/${userId}`,
                        { password: newPassword },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                      toast.success("✅ Password updated");
                    } catch {
                      toast.error("❌ Failed to update password");
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                💼 Wallet Balance: ₦{balance.toLocaleString()}
              </h2>

              <p className="text-sm text-yellow-600 mb-4">
                ⚠️ If your wallet hasn't updated yet, please wait a moment or
                refresh the page.
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Fund Wallet</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="number"
                    placeholder="Amount (₦)"
                    className="border p-2 rounded w-full sm:w-1/2"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handleFundWallet}
                  >
                    Fund Now
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">📡 Buy Data</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Network"
                    className="border p-2 w-full rounded"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    className="border p-2 w-full rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <select
                    className="border p-2 w-full rounded"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="">Select Plan</option>
                    {dataPlans.map((p) => (
                      <option key={p.plan_id} value={p.plan_id}>
                        {p.name} - ₦{p.price}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBuyData}
                    className="bg-green-600 text-white px-4 py-2 rounded w-full"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-bold text-yellow-800 mb-3">
                  📞 Buy Airtime
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Network"
                    className="border border-yellow-300 p-2 w-full rounded"
                    value={airtimeNetwork}
                    onChange={(e) => setAirtimeNetwork(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    className="border border-yellow-300 p-2 w-full rounded"
                    value={airtimePhone}
                    onChange={(e) => setAirtimePhone(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="border border-yellow-300 p-2 w-full rounded"
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(Number(e.target.value))}
                  />
                  <button
                    onClick={confirmBuyAirtime}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded w-full transition-all"
                  >
                    🚀 Buy Airtime Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "viewed" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">🕵️ Recently Viewed</h2>
              {recentlyViewed.length === 0 ? (
                <p className="text-gray-500">
                  You haven't viewed any items yet.
                </p>
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
          )}
        </motion.div>
      </AnimatePresence>

      {showModal && selectedPlanDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Confirm Data Purchase
            </h2>
            <p className="mb-2">Network: {network}</p>
            <p className="mb-2">Plan: {selectedPlanDetails?.name}</p>
            <p className="mb-2">Price: ₦{selectedPlanDetails?.price}</p>
            <p className="mb-4">
              Validity: {selectedPlanDetails?.validity || "N/A"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={confirmBuyData}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
