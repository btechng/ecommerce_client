import React, { useEffect, useState } from "react";
import axios from "axios";

interface Entry {
  _id: string;
  name: string;
  score: number;
  createdAt: string;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/trivia/leaderboard"
      );
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        🏆 Trivia Leaderboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading leaderboard...</p>
      ) : (
        <div className="overflow-x-auto rounded shadow-md bg-white">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Rank</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Score</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <tr key={entry._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-semibold">{index + 1}</td>
                    <td className="py-2 px-4">
                      {entry.name}
                      {entry.score >= 100 && (
                        <span
                          className="ml-2 inline-block text-yellow-500"
                          title="Trivia Master"
                        >
                          🏅
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-green-700 font-bold">
                      {entry.score}
                    </td>
                    <td className="py-2 px-4 text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No scores submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
