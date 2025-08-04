import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function SuccessCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyPayment = async () => {
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
      } catch (err) {
        console.error("Verification failed", err);
        toast.error("❌ Could not verify payment.");
      } finally {
        setTimeout(() => navigate("/profile"), 3000);
      }
    };

    if (reference && token) {
      verifyPayment();
    }
  }, [reference, token]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-2">🎉 Payment Successful!</h1>
      <p>Verifying and updating wallet...</p>
    </div>
  );
}
