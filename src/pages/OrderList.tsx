import React, { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch {
      alert("Failed to load orders");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `https://ecommerce-server-or19.onrender.com/api/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="pt-4">
      <h2 className="text-xl font-semibold mb-4">📦 Orders</h2>
      <div className="overflow-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-2">{order.user?.name || "Guest"}</td>
                <td className="p-2 text-center">
                  ₦{order.totalAmount.toLocaleString()}
                </td>
                <td className="p-2 text-center">{order.status}</td>
                <td className="p-2 text-center">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 text-center">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option>pending</option>
                    <option>processing</option>
                    <option>shipped</option>
                    <option>delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
