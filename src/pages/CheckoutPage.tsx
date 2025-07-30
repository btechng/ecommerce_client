import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const handleCheckout = async () => {
    if (!address.trim() || !phone.trim()) {
      return alert("Address and phone number are required");
    }

    try {
      const orderPayload = {
        cart,
        address,
        phone,
        totalAmount: calculateTotal(),
      };

      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/cart/checkout",
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear backend cart
      await axios.delete(
        "https://ecommerce-server-or19.onrender.com/api/cart/clear",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optionally clear local cart too
      localStorage.removeItem("cart");

      alert("✅ Order placed successfully!");
      navigate("/my-orders"); // or navigate("/thank-you")
    } catch (err: any) {
      alert(err.response?.data?.error || "Checkout failed");
    }
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

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              ✅ Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
