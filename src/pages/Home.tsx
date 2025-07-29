import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
}

const IMAGE_URL =
  "https://lh3.googleusercontent.com/d/1xHmVJhIRbXYUYZ0pAIXDVdbapWq7dxl6";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/products")
      .then((res) => {
        const data: Product[] = res.data;
        setProducts(data);
        setFilteredProducts(data);
        const uniqueCategories = Array.from(
          new Set(data.map((p) => p.category))
        );
        setCategories(["All", ...uniqueCategories]);
      })
      .catch(() => alert("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${IMAGE_URL})` }}
    >
      {/* 🔳 Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* ✅ Content Layer */}
      <div className="relative z-10">
        {/* ✅ Hero Section */}
        <div className="w-full py-8 px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            <motion.img
              src={IMAGE_URL}
              alt="Logo"
              className="h-20 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{
                scale: [1, 1.1, 0.95, 1.05, 1],
                transition: { duration: 0.6 },
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-lg mb-4 font-medium">
            Where Tasks Meet the Cart – Buy & Sell with Ease
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 border p-2 rounded text-black"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border p-2 rounded w-full sm:w-40 text-black"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                to="/add-product"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Sell Your Product
              </Link>
              <Link
                to="/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ Product Grid */}
        <div className="p-4 max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-300/40 animate-pulse h-56 rounded-xl"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {filteredProducts.map((product) => (
                <Link to={`/product/${product._id}`} key={product._id}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="bg-white bg-opacity-90 rounded-xl shadow-md p-3 flex flex-col h-full hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={
                        product.imageUrl || "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="rounded-lg mb-2 object-cover h-40 w-full"
                    />
                    <p className="text-base font-semibold break-words">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {product.description}
                    </p>
                    <p className="text-indigo-700 font-bold mt-1">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
