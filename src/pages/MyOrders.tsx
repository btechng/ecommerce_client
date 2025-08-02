import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  product: {
    name: string;
    _id: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  address: string;
  phone: string;
  totalAmount: number;
  paymentRef: string;
  status: string;
  createdAt: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-server-or19.onrender.com/api/orders/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  if (loading) return <div className="p-4 pt-24">Loading your orders...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 pt-24">
      <h1 className="text-2xl font-bold mb-6">📦 My Orders</h1>

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">🧾 Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    order.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-2">
                <p className="font-medium">📍 Address:</p>
                <p className="text-sm text-gray-600 mb-2">{order.address}</p>

                <p className="font-medium">📞 Phone:</p>
                <p className="text-sm text-gray-600 mb-2">{order.phone}</p>

                <p className="font-medium">🧾 Payment Ref:</p>
                <p className="text-sm text-gray-600 mb-2">{order.paymentRef}</p>

                <p className="font-medium">🛒 Items:</p>
                <ul className="list-disc pl-5 mb-2 text-sm text-gray-700">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product.name} x {item.quantity}
                    </li>
                  ))}
                </ul>

                <p className="font-bold text-right">
                  💰 Total: ₦{order.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
