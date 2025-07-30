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
  location?: string;
  createdAt?: string;
}

export default function CategoryPage() {
  const { categoryName } = useParams(); // e.g., "jobvacancy"
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isJobCategory = categoryName
    ?.toLowerCase()
    .replace(/\s+/g, "")
    .includes("job");

  useEffect(() => {
    if (!categoryName) return;

    setLoading(true);

    axios
      .get(
        `https://ecommerce-server-or19.onrender.com/api/products/category/${categoryName}`
      )
      .then((res) => {
        let fetched = res.data;

        // Sort job posts by createdAt (newest first)
        if (isJobCategory) {
          fetched = fetched.sort(
            (a: Product, b: Product) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          );
        }

        setProducts(fetched);
      })
      .catch(() => alert("Failed to load products"))
      .finally(() => setLoading(false));
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
        {categoryName?.replace(/-/g, " ")}{" "}
        {isJobCategory ? "Listings" : "Products"}
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isJobItem = product.category
              ?.toLowerCase()
              .replace(/\s+/g, "")
              .includes("job");

            return (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="border rounded-lg shadow-sm hover:shadow-md transition bg-white"
              >
                {!isJobItem && (
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  {product.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {product.location}
                    </p>
                  )}
                  {!isJobItem && (
                    <p className="text-indigo-600 font-bold">
                      ₦{product.price?.toLocaleString() || "Contact"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
