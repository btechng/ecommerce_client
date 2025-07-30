import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
}

export default function UserProfile() {
  const [userName, setUserName] = useState("User");
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUserName(storedName);

    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(viewed);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24">
      <h1 className="text-3xl font-bold mb-6">Hello, {userName}</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">🕵️ Recently Viewed</h2>
        {recentlyViewed.length === 0 ? (
          <p className="text-gray-500">You haven't viewed any items yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentlyViewed.map((item) => (
              <Link to={`/product/${item._id}`} key={item._id}>
                <div className="border rounded-xl p-3 bg-white shadow hover:shadow-md transition">
                  {item.imageUrl &&
                    !item.category?.toLowerCase().includes("job") && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-32 w-full object-cover rounded mb-2"
                      />
                    )}
                  <h3 className="text-md font-semibold truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
