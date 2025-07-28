import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/products")
      .then((res) => setProducts(res.data))
      .catch(() => alert("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="border rounded-lg shadow hover:shadow-md transition duration-200 bg-white"
          >
            <img
              src={product.imageUrl || "https://via.placeholder.com/300"}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1 truncate">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600 mb-2 truncate">
                {product.description}
              </p>
              <p className="text-indigo-600 font-bold text-lg">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
