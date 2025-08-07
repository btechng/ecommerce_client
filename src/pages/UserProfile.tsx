// src/pages/UserProfile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wallet, Eye, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
}

interface DataPlan {
  plan_id: string;
  name: string;
  price: number;
  validity?: string;
  network?: string;
}

const networkLogos: Record<string, string> = {
  MTN: "https://ibb.co/zdDjBrm",
  GLO: "https://ibb.co/HDMv3zRR",
  Airtel: "https://ibb.co/4nYrRsFW",
  "9mobile": "https://ibb.co/xSHL1Cbc",
};

export default function UserProfile() {
  const [userName, setUserName] = useState("User");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [amount, setAmount] = useState(0);
  const [airtimeNetwork, setAirtimeNetwork] = useState("");
  const [airtimePhone, setAirtimePhone] = useState("");
  const [airtimeAmount, setAirtimeAmount] = useState(0);
  const [dataNetwork, setDataNetwork] = useState("");
  const [dataPhone, setDataPhone] = useState("");
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [dataPlanId, setDataPlanId] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const apiBase = "https://ecommerce-server-or19.onrender.com";
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchAll = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(`${apiBase}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(res.data.balance || 0);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("Error fetching wallet info", err);
      }
    };
    fetchAll();
  }, [token, userId]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get("reference");
    if (reference) {
      verifyPayment(reference);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/wallet/data-plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDataPlans(res.data);
      } catch (err) {
        console.error("Error fetching data plans", err);
      }
    };
    fetchPlans();
  }, [token]);

  const verifyPayment = async (reference: string) => {
    setVerifying(true);
    try {
      const res = await axios.get(
        `${apiBase}/api/wallet/verify?reference=${reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setBalance(res.data.balance);
        toast.success("✅ Wallet funded successfully");
        navigate(location.pathname);
      } else {
        toast.error("❌ Verification failed");
      }
    } catch {
      toast.error("❌ Error verifying payment");
    } finally {
      setVerifying(false);
    }
  };

  const refreshBalance = async () => {
    if (!token || !userId) return;
    try {
      const res = await axios.get(`${apiBase}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(res.data.balance || 0);
      toast.success("✅ Balance refreshed");
    } catch {
      toast.error("❌ Failed to refresh balance");
    }
  };

  const handleFundWallet = async () => {
    try {
      const res = await axios.post(
        `${apiBase}/api/wallet/fund`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.data.authorization_url;
    } catch {
      toast.error("❌ Error initiating payment");
    }
  };

  const handleBuyAirtime = async () => {
    if (!airtimeNetwork || !airtimePhone || !airtimeAmount) {
      toast.error("❌ Fill all airtime fields");
      return;
    }

    if (airtimeAmount > balance) {
      toast.error("❌ Insufficient wallet balance");
      return;
    }

    try {
      await axios.post(
        `${apiBase}/api/wallet/request-airtime`,
        {
          network: airtimeNetwork,
          phone: airtimePhone,
          amount: airtimeAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBalance((prev) => prev - airtimeAmount);
      toast.success("✅ Airtime request sent and wallet deducted");

      setAirtimePhone("");
      setAirtimeAmount(0);
      setAirtimeNetwork("");
    } catch (err: any) {
      console.error("❌ Airtime error:", err);
      toast.error("❌ Failed to process airtime request");
    }
  };

  const handleBuyData = async () => {
    if (!dataNetwork || !dataPhone || !dataPlanId) {
      toast.error("❌ Fill all data fields");
      return;
    }

    const selectedPlan = dataPlans.find((p) => p.plan_id === dataPlanId);
    if (!selectedPlan) {
      toast.error("❌ Invalid data plan");
      return;
    }

    if (selectedPlan.price > balance) {
      toast.error("❌ Insufficient wallet balance");
      return;
    }

    try {
      await axios.post(
        `${apiBase}/api/wallet/request-data`,
        {
          userId,
          network: dataNetwork,
          phone: dataPhone,
          plan: selectedPlan.name,
          planId: selectedPlan.plan_id,
          price: selectedPlan.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBalance((prev) => prev - selectedPlan.price);
      toast.success("✅ Data request sent and wallet deducted");

      setDataPhone("");
      setDataPlanId("");
      setDataNetwork("");
    } catch {
      toast.error("❌ Failed to process data request");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        `${apiBase}/api/users/${userId}`,
        { name: newName, email: newEmail, password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserName(newName);
      setEmail(newEmail);
      localStorage.setItem("username", newName);
      localStorage.setItem("email", newEmail);
      toast.success("✅ Profile updated");
      setEditing(false);
    } catch {
      toast.error("❌ Failed to update profile");
    }
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

      {/* Tabs */}
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

      {/* Tab content */}
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
            <div className="bg-white p-6 rounded shadow mb-6">
              {!editing ? (
                <>
                  <p className="mb-2">👤 Name: {userName}</p>
                  <p className="mb-2">📧 Email: {email}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 underline"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    className="border p-2 rounded w-full"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    className="border p-2 rounded w-full"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    className="border p-2 rounded w-full"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
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
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💼 Wallet Balance: ₦{balance.toLocaleString()}
                <button
                  onClick={refreshBalance}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Refresh
                </button>
              </h2>

              {verifying && (
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <Loader2 className="animate-spin w-4 h-4" /> Verifying
                  payment...
                </div>
              )}

              {/* Fund Wallet */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">💳 Fund Wallet</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount (₦)"
                    className="border p-2 rounded w-full"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <button
                    onClick={handleFundWallet}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Fund Now
                  </button>
                </div>
              </div>

              {/* Airtime */}
              <div className="mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">📞 Buy Airtime</h3>

                <select
                  className="border p-2 w-full rounded"
                  value={airtimeNetwork}
                  onChange={(e) => setAirtimeNetwork(e.target.value)}
                >
                  <option value="">Select Network</option>
                  <option value="MTN">MTN</option>
                  <option value="GLO">GLO</option>
                  <option value="Airtel">Airtel</option>
                  <option value="9mobile">9mobile</option>
                </select>

                {airtimeNetwork && networkLogos[airtimeNetwork] && (
                  <img
                    src={networkLogos[airtimeNetwork]}
                    alt="Network Logo"
                    className="h-6 mt-2"
                  />
                )}

                {/* Add this phone number input for airtime */}
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={airtimePhone}
                  onChange={(e) => setAirtimePhone(e.target.value)}
                  className="border p-2 w-full rounded mt-2"
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={airtimeAmount}
                  onChange={(e) => setAirtimeAmount(Number(e.target.value))}
                  className="border p-2 w-full rounded mt-2"
                />

                <button
                  onClick={handleBuyAirtime}
                  className="bg-yellow-600 text-white px-4 py-2 rounded w-full mt-3"
                >
                  Buy Airtime
                </button>
              </div>

              {/* Data */}
              <div className="mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">📡 Buy Data</h3>
                <select
                  className="border p-2 w-full rounded"
                  value={dataNetwork}
                  onChange={(e) => setDataNetwork(e.target.value)}
                >
                  <option value="">Select Network</option>
                  <option value="MTN">MTN</option>
                  <option value="GLO">GLO</option>
                  <option value="Airtel">Airtel</option>
                  <option value="9mobile">9mobile</option>
                </select>
                {dataNetwork && networkLogos[dataNetwork] && (
                  <img
                    src={networkLogos[dataNetwork]}
                    alt="Network Logo"
                    className="h-6 mt-2"
                  />
                )}
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={dataPhone}
                  onChange={(e) => setDataPhone(e.target.value)}
                  className="border p-2 w-full rounded mt-2"
                />
                <select
                  className="border p-2 w-full rounded mt-2"
                  value={dataPlanId}
                  onChange={(e) => setDataPlanId(e.target.value)}
                >
                  <option value="">Select Plan</option>
                  {dataPlans.map((plan) => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.name} - ₦{plan.price}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBuyData}
                  className="bg-green-600 text-white px-4 py-2 rounded w-full mt-3"
                >
                  Buy Data
                </button>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-semibold mb-2">🧾 Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-500">No transactions yet.</p>
                ) : (
                  <ul className="divide-y">
                    {transactions.map((txn, index) => (
                      <li key={index} className="py-2 text-sm">
                        {txn.type} - ₦{txn.amount} (
                        {new Date(txn.date).toLocaleString()})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {activeTab === "viewed" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">🕵️ Recently Viewed</h2>
              {recentlyViewed.length === 0 ? (
                <p className="text-gray-600">No items viewed yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentlyViewed.map((item) => (
                    <Link to={`/product/${item._id}`} key={item._id}>
                      <div className="border rounded p-3 hover:shadow">
                        {item.imageUrl &&
                          !item.category?.toLowerCase().includes("job") && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                        <h3 className="font-semibold text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
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
    </div>
  );
}
