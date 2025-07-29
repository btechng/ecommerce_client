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
  const [jobs, setJobs] = useState<Product[]>([]);
  const [searchJobs, setSearchJobs] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/products")
      .then((res) => {
        const data: Product[] = res.data.reverse(); // newest first
        const jobItems = data.filter((p) =>
          p.category.toLowerCase().includes("job/vacancy")
        );
        const productItems = data.filter(
          (p) => !p.category.toLowerCase().includes("job/vacancy")
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
    .slice(0, 12);

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

          {/* ✅ ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-3xl mx-auto">
            <Link
              to="/add-product"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            >
              Sell Your Product
            </Link>
            <Link
              to="/post-job"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Post a Job
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/category/jobvacancy"
              className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg block max-w-xl mx-auto hover:bg-yellow-600 transition"
            >
              Check Out Recent Jobs And Vacancies
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
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
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

        {/* ✅ PRODUCT SECTION */}
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
                <Link
                  to="/products"
                  className="text-blue-400 hover:underline font-semibold"
                >
                  See All Products →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
