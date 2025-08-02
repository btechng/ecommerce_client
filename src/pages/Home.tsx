// Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TriviaGame from "../components/TriviaGame";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  location?: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
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
  const [showTrivia, setShowTrivia] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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

    toast.info("🧠 Test Your Brain with Trivia Questions Below", {
      position: "top-center",
      autoClose: 4000,
    });

    axios
      .get("https://ecommerce-server-or19.onrender.com/api/trivia/leaderboard")
      .then((res) => setLeaderboard(res.data.slice(0, 5)))
      .catch(() => console.warn("Failed to fetch leaderboard"));
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
        {/* HERO SECTION */}
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
              to="/post-product"
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

        {/* JOBS FIRST */}
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {filteredJobs.map((job) => (
                <Link to={`/product/${job._id}`} key={job._id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white bg-opacity-90 rounded-xl shadow-md p-4"
                  >
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      {job.category}
                    </span>
                    <h3 className="font-bold mt-1">{job.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {job.description}
                    </p>
                    {job.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {job.location}
                      </p>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCTS AFTER JOBS */}
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
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Link to={`/product/${product._id}`} key={product._id}>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      className="bg-white bg-opacity-90 rounded-xl shadow-md p-3 flex flex-col h-full"
                    >
                      <img
                        src={
                          product.imageUrl || "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className="rounded-lg mb-2 object-cover h-32 w-full"
                      />
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-indigo-700 font-bold mt-1">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
              {!viewAllProducts && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setViewAllProducts(true)}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    See All Products →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* TRIVIA SECTION */}
        <div className="px-4 pb-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              🎮 Trivia Challenge
            </h2>
            {!showTrivia ? (
              <button
                onClick={() => setShowTrivia(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Start Trivia
              </button>
            ) : (
              <TriviaGame />
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="bg-white rounded-xl shadow-md mt-6 px-6 py-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🏆 Top 5 Trivia Players
              </h3>
              <ul className="divide-y divide-gray-300">
                {leaderboard.map((entry, idx) => (
                  <li key={idx} className="py-2 flex justify-between">
                    <span>
                      {idx + 1}. {entry.name}
                    </span>
                    <span className="font-bold text-indigo-600">
                      {entry.score}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-right mt-2">
                <Link
                  to="/leaderboard"
                  className="text-indigo-500 hover:underline text-sm"
                >
                  View Full Leaderboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
