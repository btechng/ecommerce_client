import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function SuccessCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        toast.error("❌ No payment reference found.");
        return navigate("/profile");
      }

      try {
        const res = await axios.get(
          `https://ecommerce-server-or19.onrender.com/api/wallet/verify?reference=${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("✅ Wallet funded successfully!");
      } catch (err: any) {
        toast.error("❌ Wallet funding verification failed.");
        console.error("Verification error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
        setTimeout(() => navigate("/profile"), 3000);
      }
    };

    verifyPayment();
  }, [reference]);

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
          <h1 className="text-2xl font-bold mb-2">🎉 Payment Successful!</h1>
          <p>Redirecting you to your dashboard...</p>
        </>
      )}
    </div>
  );
}
