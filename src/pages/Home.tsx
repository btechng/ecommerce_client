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
        const products: Product[] = res.data;
        setProducts(products);
        setFilteredProducts(products);

        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category))
        );
        setCategories(["All", ...uniqueCategories]);
      })
      .catch(() => alert("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === cat));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        p.description.toLowerCase().includes(value)
    );
    setFilteredProducts(
      selectedCategory === "All"
        ? filtered
        : filtered.filter((p) => p.category === selectedCategory)
    );
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ✅ Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-indigo-700">TasknCart</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Where Tasks Meet the Cart – Buy & Sell with Ease.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="w-full sm:w-64 border p-2 rounded"
          />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border p-2 rounded w-full sm:w-40"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <Link
            to="/add-product"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Sell Your Product
          </Link>
        </div>
      </motion.div>

      {/* ✅ Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/product/${product._id}`}
                className="border rounded-lg shadow bg-white hover:shadow-lg"
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
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No products found.
          </div>
        )}
      </motion.div>
    </div>
  );
}
