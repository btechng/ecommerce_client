import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function SuccessCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const apiBase = "https://ecommerce-server-or19.onrender.com";

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        toast.error("❌ No payment reference found.");
        navigate("/");
        return;
      }

      try {
        // Use /verify/:reference route, pass reference as param
        const res = await axios.get(
          `${apiBase}/api/wallet/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Verification Response:", res.data);

        if (res.data.success) {
          toast.success("✅ Wallet funded successfully!");
          // Store updated balance from backend response
          localStorage.setItem(
            "balance",
            res.data.newBalance?.toString() || "0"
          );
        } else {
          toast.error(
            res.data.message || "❌ Payment not verified as successful"
          );
        }
      } catch (err: any) {
        console.error(
          "❌ Verification error:",
          err.response?.data || err.message
        );
        toast.error("❌ Payment verification failed.");
      } finally {
        // Remove reference from URL for cleaner UX
        const url = new URL(window.location.href);
        url.searchParams.delete("reference");
        window.history.replaceState({}, document.title, url.toString());

        setLoading(false);
        setTimeout(() => navigate("/"), 2000); // Redirect to home page here
      }
    };

    verifyPayment();
  }, [reference, token, navigate]);

  return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
      {loading ? (
        <>
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            Verifying your payment...
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">🎉 Payment Verified</h1>
          <p>Redirecting to your home page...</p>
        </>
      )}
    </div>
  );
}
