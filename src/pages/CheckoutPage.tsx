import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PaystackButton } from "react-paystack";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail") || "user@example.com"; // Update this if user data is available

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-server-or19.onrender.com/api/cart",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCart(res.data);
      } catch (err) {
        alert("Failed to fetch cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const publicKey = "pk_live_755c52be93e9db58f39401f0ecb9d20df9e0cdbe"; // Replace with your real Paystack public key
  const amount = calculateTotal() * 100; // Paystack expects amount in kobo
  const reference = `ref-${Date.now()}`;

  const paystackProps = {
    email,
    amount,
    reference,
    publicKey,
    metadata: {
      custom_fields: [
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone,
        },
        {
          display_name: "Shipping Address",
          variable_name: "shipping_address",
          value: address,
        },
      ],
    },
    onSuccess: async (response: any) => {
      try {
        const orderPayload = {
          cart,
          address,
          phone,
          totalAmount: calculateTotal(),
          paymentRef: response.reference,
        };

        await axios.post(
          "https://ecommerce-server-or19.onrender.com/api/cart/checkout",
          orderPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.delete(
          "https://ecommerce-server-or19.onrender.com/api/cart/clear",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem("cart");
        alert("✅ Payment successful & order placed!");
        navigate("/my-orders");
      } catch (err: any) {
        alert(err.response?.data?.error || "Order failed after payment");
      }
    },
    onClose: () => {
      alert("Payment dialog was closed");
    },
  };

  if (loading) return <div className="p-4 pt-24">Loading cart...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-24">
      <h1 className="text-2xl font-bold mb-4">🧾 Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center gap-4 border p-3 rounded"
              >
                <img
                  src={
                    item.product.imageUrl || "https://via.placeholder.com/80"
                  }
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    ₦{item.product.price?.toLocaleString()} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Shipping Info</h2>
            <input
              className="w-full border p-2 mb-2"
              placeholder="Shipping Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              className="w-full border p-2 mb-4"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="text-right text-lg font-bold mb-4">
              Total: ₦{calculateTotal().toLocaleString()}
            </div>

            <PaystackButton
              {...paystackProps}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              disabled={!address || !phone}
            >
              ✅ Pay Now
            </PaystackButton>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
