import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    alert("✅ Payment successful! Wallet will update shortly.");
    setTimeout(() => navigate("/dashboard"), 3000);
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-2">🎉 Payment Successful!</h1>
      <p>Redirecting you to your dashboard...</p>
    </div>
  );
}
