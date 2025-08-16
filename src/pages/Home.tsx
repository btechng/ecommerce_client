import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, useInView } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TriviaGame from "../components/TriviaGame";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import HeroImage from "../images/1000359737.jpg";
import LogoImage from "../images/1000359731.jpg";
import ButtonBackground from "../images/1000359737.jpg";

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

interface SocialPost {
  _id: string;
  author: { username: string; avatarUrl?: string; _id: string };
  title: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: { _id: string; author: { username: string }; content: string }[];
}

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
}

const heroText = "Find Products and Job Opportunities on One Platform";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const buttonStagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
    },
  }),
};

export default function Home() {
  const { user } = useAuth();
  const token = localStorage.getItem("socialToken");

  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Product[]>([]);
  const [searchJobs, setSearchJobs] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewAllProducts, setViewAllProducts] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Social feed
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<
    { _id: string; from: string; to: string; content: string }[]
  >([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const ctaRef = useRef(null);
  const isInView = useInView(ctaRef, { once: true });

  useEffect(() => {
    // Load products & jobs
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

    // Load Trivia leaderboard
    axios
      .get("https://ecommerce-server-or19.onrender.com/api/trivia/leaderboard")
      .then((res) => setLeaderboard(res.data.slice(0, 5)))
      .catch(() => console.warn("Failed to fetch leaderboard"));

    toast.info("🧠 Test Your Brain with Trivia Questions Below", {
      position: "top-center",
      autoClose: 4000,
    });

    // Load social feed
    if (!token) return;
    const socket = io("https://social-blog-server-6g7j.onrender.com", {
      auth: { token },
    });
    socketRef.current = socket;

    // Fetch initial social posts
    axios
      .get("https://social-blog-server-6g7j.onrender.com/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSocialPosts(res.data.data || []))
      .catch(console.error);

    // Join user room for real-time updates
    if (user) socket.emit("join", user._id);

    // Listen for new posts
    socket.on("post:new", (post: SocialPost) => {
      setSocialPosts((prev) => [post, ...prev]);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

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

  // Social feed actions
  const handlePost = async () => {
    if (!newTitle || !newContent || !token) return;
    try {
      const res = await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/posts",
        { title: newTitle, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socketRef.current?.emit("post:new", res.data);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (post: SocialPost) => {
    if (!token) return;
    const res = await axios.post(
      `https://ecommerce-server-or19.onrender.com/api/posts/${post._id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSocialPosts((prev) =>
      prev.map((p) => (p._id === post._id ? res.data : p))
    );
  };

  const handleComment = async (postId: string) => {
    if (!token || !commentText[postId]?.trim()) return;
    const res = await axios.post(
      `https://ecommerce-server-or19.onrender.com/api/posts/${postId}/comment`,
      { content: commentText[postId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSocialPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, comments: [...p.comments, res.data] } : p
      )
    );
    setCommentText({ ...commentText, [postId]: "" });
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeChat || !token) return;
    const res = await axios.post(
      `/chat/${activeChat._id}`,
      { content: text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages((prev) => [...prev, res.data]);
    setText("");
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${HeroImage})` }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10">
        <div className="w-full py-12 px-4 text-center text-white relative">
          <motion.img
            src={LogoImage}
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

          <motion.p
            className="text-lg mb-6 font-medium"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {heroText.split("").map((char, index) => (
              <motion.span key={index} variants={cardVariants}>
                {char}
              </motion.span>
            ))}
          </motion.p>

          <div
            className="w-full py-8 px-4 rounded-lg shadow-lg bg-cover bg-center bg-no-repeat text-center relative mb-10"
            style={{ backgroundImage: `url(${ButtonBackground})` }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">
              🎉 Welcome to TasknCart!
            </h2>
            <div className="flex flex-wrap justify-center items-center px-4 w-full sm:w-auto mt-6 gap-3 sm:gap-4 md:gap-6">
              {[
                "/register",
                "/post-product",
                "/post-job",
                "/profile",
                "/category/products",
              ].map((path, i) => (
                <motion.div
                  key={path}
                  custom={i}
                  variants={buttonStagger}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={path}
                    className={
                      [
                        "bg-green-600",
                        "bg-blue-600",
                        "bg-purple-600",
                        "bg-orange-500",
                        "bg-pink-500",
                      ][i] +
                      " text-white px-4 py-2 rounded-md shadow hover:brightness-110"
                    }
                  >
                    {
                      [
                        "Sign Up",
                        "🛒 Sell",
                        "📢 Job",
                        "📄 Aitime/Data",
                        "🛍️ Shop",
                      ][i]
                    }
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-10"
          >
            <Link
              to="/category/jobvacancy"
              className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg inline-block hover:bg-yellow-600 transition"
            >
              🔎 Recent Jobs & Vacancies
            </Link>
          </motion.div>
        </div>

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
                  className="bg-white/10 rounded-xl p-4 animate-pulse space-y-2"
                >
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3 mt-2"></div>
                </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-xl animate-pulse p-3"
                >
                  <div className="bg-gray-300 rounded-lg h-32 mb-2 w-full" />
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-300 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
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
        {/* Social Feed Section */}
        <div className="p-4 max-w-6xl mx-auto mt-10">
          <h2 className="text-white text-2xl font-bold mb-4">📢 Social Feed</h2>

          {/* Add Post Link */}
          <div className="mb-4">
            <Link
              to="/social-dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ➕ Add a Post
            </Link>
          </div>

          {socialPosts.length === 0 ? (
            <p className="text-white">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {socialPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col"
                >
                  {/* Post Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.author.avatarUrl || "https://placehold.co/32"}
                      alt={post.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <strong>{post.author.username}</strong>
                  </div>

                  {/* Post Content */}
                  <h3 className="font-semibold">{post.title}</h3>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg my-2"
                    />
                  )}
                  <div
                    className="text-gray-700 mb-2 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Likes & Comments */}
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-red-500 font-semibold">
                      ❤ {post.likes?.length || 0}
                    </span>
                    <Link
                      to={`/social-post/${post._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      💬 {post.comments?.length || 0} Comments
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
