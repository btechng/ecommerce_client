import React, { useEffect, useState } from "react";
import axios from "axios";

interface Transaction {
  _id: string;
  type: string;
  channel?: string;
  status: string;
  amount: number;
  description?: string;
  reference?: string;
  date: string;
}

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const apiBase = "https://ecommerce-server-or19.onrender.com";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBase}/api/wallet/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(res.data.transactions);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token]);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Amount</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Reference</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 capitalize">{tx.type}</td>
                <td className="border px-4 py-2">₦{tx.amount.toFixed(2)}</td>
                <td className="border px-4 py-2 capitalize">{tx.status}</td>
                <td className="border px-4 py-2">{tx.reference || "-"}</td>
                <td className="border px-4 py-2">
                  {new Date(tx.date).toLocaleString()}
                </td>
                <td className="border px-4 py-2">{tx.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
