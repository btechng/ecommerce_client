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
  location?: string;
}

const IMAGE_URL =
  "https://lh3.googleusercontent.com/d/1xHmVJhIRbXYUYZ0pAIXDVdbapWq7dxl6";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Product[]>([]);
  const [searchJobs, setSearchJobs] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewAllProducts, setViewAllProducts] = useState(false);

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/products")
      .then((res) => {
        const data: Product[] = res.data.reverse();
        const jobItems = data.filter(
          (p) => p.category.toLowerCase() === "job/vacancy"
        );
        const productItems = data.filter(
          (p) => p.category.toLowerCase() !== "job/vacancy"
        );
        setJobs(jobItems);
        setProducts(productItems);
      })
      .catch(() => alert("Failed to load items"))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchJobs.toLowerCase()) ||
        p.description.toLowerCase().includes(searchJobs.toLowerCase())
    )
    .slice(0, 4);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
        p.description.toLowerCase().includes(searchProducts.toLowerCase())
    )
    .slice(0, viewAllProducts ? undefined : 12);

  return (
    <div
      className="relative min-h-screen bg-cover bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${IMAGE_URL})` }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10">
        {/* ✅ HERO SECTION */}
        <div className="w-full py-8 px-4 text-center text-white">
          <motion.img
            src={IMAGE_URL}
            alt="Logo"
            className="h-20 rounded-full mx-auto mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{
              scale: [1, 1.1, 0.95, 1.05, 1],
              transition: { duration: 0.6 },
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <p className="text-lg mb-4 font-medium">
            Find Products and Job Opportunities on One Platform
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-3xl mx-auto">
            <Link
              to="/add-product"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            >
              🛒 Sell Your Product
            </Link>
            <Link
              to="/post-job"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              📢 Post a Job
            </Link>
            <Link
              to="/build-cv"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full sm:w-auto"
            >
              📄 Build Your CV
            </Link>
            <Link
              to="/category/products"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full sm:w-auto"
            >
              🛍️ See Products For Sale
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/category/jobvacancy"
              className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg block max-w-xl mx-auto hover:bg-yellow-600 transition"
            >
              🔎 Recent Jobs And Vacancies
            </Link>
          </div>
        </div>

        {/* ✅ JOBS SECTION */}
        <div className="p-4 max-w-6xl mx-auto">
          <h2 className="text-white text-xl font-semibold mb-2">
            🟡 Jobs & Vacancies
          </h2>
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchJobs}
            onChange={(e) => setSearchJobs(e.target.value)}
            className="w-full sm:w-80 border p-2 rounded mb-4 text-black"
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-300/40 animate-pulse h-36 rounded-xl"
                ></div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="text-white">No jobs found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {filteredJobs.map((job) => (
                  <Link to={`/product/${job._id}`} key={job._id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white bg-opacity-90 rounded-xl shadow-md p-4 h-full flex flex-col justify-between"
                    >
                      <span className="text-sm bg-yellow-200 text-yellow-800 font-semibold w-fit px-2 py-0.5 rounded mb-1">
                        {job.category}
                      </span>
                      <h3 className="font-bold text-md">{job.name}</h3>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-1">
                        {job.description}
                      </p>
                      {job.location && (
                        <p className="text-xs text-gray-600 italic">
                          📍 {job.location}
                        </p>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
              <div className="text-center mb-8">
                <Link
                  to="/category/jobvacancy"
                  className="text-yellow-400 hover:underline font-semibold"
                >
                  See All Jobs →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ✅ PRODUCTS SECTION */}
        <div className="p-4 max-w-6xl mx-auto">
          <h2 className="text-white text-xl font-semibold mb-2">🛒 Products</h2>
          <input
            type="text"
            placeholder="Search products..."
            value={searchProducts}
            onChange={(e) => setSearchProducts(e.target.value)}
            className="w-full sm:w-80 border p-2 rounded mb-4 text-black"
          />

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-300/40 animate-pulse h-56 rounded-xl"
                ></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-white">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                        className="rounded-lg mb-2 object-cover h-32 w-full"
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
              <div className="text-center mt-6 mb-8">
                <button
                  onClick={() => setViewAllProducts(true)}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  {viewAllProducts
                    ? "Showing All Products"
                    : "See All Products →"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ✅ WHATSAPP FLOATING BUTTON */}
        <a
          href="https://wa.me/2348148494924"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition"
          title="Chat on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            className="h-6 w-6"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.1.543 4.07 1.5 5.787L0 24l6.39-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.217 17.07c-.261.734-1.526 1.438-2.112 1.531-.586.095-1.323.135-2.126-.157-.97-.335-2.033-.73-3.536-2.208-1.306-1.3-2.19-2.902-2.449-3.392-.26-.49-.523-1.283-.106-1.897.417-.615.94-.679 1.263-.692.323-.013.622-.007.896.403.276.41.936 1.323 1.015 1.421.079.097.132.217.026.35-.106.134-.158.217-.313.337-.158.12-.33.256-.47.43-.14.173-.286.31-.122.605.163.294.727 1.2 1.56 1.79 1.074.76 1.98 1 2.27 1.112.29.112.46.093.632-.06.173-.155.737-.856.935-1.15.198-.294.39-.247.664-.148.274.1 1.73.816 2.027.963.298.148.497.222.57.344.073.122.073.705-.188 1.439z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
