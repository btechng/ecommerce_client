import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

const Cart = () => {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="pt-24 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">
          Your cart is empty.{" "}
          <Link to="/" className="text-blue-500 underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-6">
          {cart.map((product) => (
            <div
              key={product._id}
              className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white shadow-md rounded-lg p-4"
            >
              <img
                src={product.imageUrl || "https://via.placeholder.com/100"}
                alt={product.name}
                className="w-32 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600 text-sm">
                  {product.description.slice(0, 100)}...
                </p>
                <p className="mt-2 text-indigo-600 font-semibold">
                  ₦{product.price?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(product._id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                ❌ Remove
              </button>
            </div>
          ))}

          <div className="text-right text-lg font-semibold mt-6">
            Total: ₦{total.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
