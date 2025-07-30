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
  phoneNumber?: string;
  email?: string;
  createdAt?: string;
}

export default function CategoryPage() {
  const { categoryName } = useParams();
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
        const sorted = res.data.sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        setProducts(sorted);
      })
      .catch(() => alert("Failed to load products"))
      .finally(() => setLoading(false));
  }, [categoryName]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
      {" "}
      {/* <-- pt-24 adds top spacing */}
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
          {products.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col"
            >
              {!isJobCategory && (
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
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
                  {!isJobCategory && (
                    <p className="text-indigo-600 font-bold">
                      ₦{product.price?.toLocaleString() || "Contact"}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div className="mt-3">
                  {isJobCategory && product.email && (
                    <p className="text-sm text-blue-600 font-medium">
                      ✉️ Apply Via Email:{" "}
                      <a
                        href={`mailto:${product.email}?subject=Job Application: ${product.name}`}
                        className="underline"
                      >
                        {product.email}
                      </a>
                    </p>
                  )}

                  {!isJobCategory && product.phoneNumber && (
                    <p className="text-sm text-green-700 font-medium">
                      📞 Call Seller:{" "}
                      <a
                        href={`tel:${product.phoneNumber}`}
                        className="underline"
                      >
                        {product.phoneNumber}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
