import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (token) {
          const res = await axios.get(
            "https://ecommerce-server-or19.onrender.com/api/cart",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCart(res.data);
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCart(localCart);
        }
      } catch (err) {
        alert("Failed to load cart");
      }
      setLoading(false);
    };

    fetchCart();
  }, [token]);

  const updateQuantity = async (productId: string, delta: number) => {
    const updated = cart.map((item) =>
      item.product._id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updated);

    if (token) {
      const item = updated.find((i) => i.product._id === productId);
      if (item) {
        await axios.post(
          "https://ecommerce-server-or19.onrender.com/api/cart",
          {
            productId: item.product._id,
            quantity: delta,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  const removeItem = async (productId: string) => {
    const updated = cart.filter((item) => item.product._id !== productId);
    setCart(updated);

    if (token) {
      await axios.delete(
        `https://ecommerce-server-or19.onrender.com/api/cart/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else {
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  if (loading) return <div className="p-4 pt-24">Loading cart...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-4">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center gap-4 border p-4 rounded shadow"
            >
              <img
                src={item.product.imageUrl || "https://via.placeholder.com/100"}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                <p className="text-gray-600">
                  ₦{item.product.price?.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="px-2 py-1 bg-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.product._id)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="text-right text-xl font-semibold">
            Total: ₦{total.toLocaleString()}
          </div>

          <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
