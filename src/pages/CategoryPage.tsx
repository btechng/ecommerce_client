// src/pages/CategoryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category: string;
}

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/products")
      .then((res) => {
        const filtered = res.data.filter(
          (product: Product) =>
            product.category.toLowerCase() === categoryName?.toLowerCase()
        );
        setProducts(filtered);
      })
      .catch(() => alert("Failed to load products"));
  }, [categoryName]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="capitalize text-gray-800">{categoryName}</span>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4 capitalize">
        {categoryName} Products
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <img
                src={product.imageUrl || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.description}
                </p>
                <p className="text-indigo-600 font-bold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
