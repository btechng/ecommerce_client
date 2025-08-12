import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Monitor,
  Shirt,
  Home,
  ShoppingCart,
  User,
  LogOut,
  Search,
  LayoutGrid,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NavImage from "../images/1000359731.jpg";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const categoryIcons: Record<string, JSX.Element> = {
  electronics: <Monitor className="w-4 h-4 inline mr-1" />,
  fashion: <Shirt className="w-4 h-4 inline mr-1" />,
  home: <Home className="w-4 h-4 inline mr-1" />,
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    axios
      .get(
        "https://ecommerce-server-or19.onrender.com/api/products/categories/list"
      )
      .then((res) => setCategories(res.data))
      .catch(() => console.warn("Failed to load categories"));

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    alert("Logged out successfully.");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ✅ Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* ✅ Logo */}
          <Link to="/" className="flex items-center">
            <motion.img
              src={NavImage}
              alt="Logo"
              className="h-10 w-auto object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: [1, 1.1, 0.95, 1.05, 1] }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
          </Link>

          {/* ✅ Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 text-white">
            <Link
              to="/"
              className={isActive("/") ? "text-indigo-500 font-semibold" : ""}
            >
              Home
            </Link>

            <button
              onClick={() => setShowCategories(true)}
              className={`hover:text-indigo-400 ${
                location.pathname.startsWith("/category")
                  ? "text-indigo-500 font-semibold"
                  : ""
              }`}
            >
              Categories ▾
            </button>

            <form
              onSubmit={handleSearch}
              className="flex border rounded overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-2 py-1 text-sm outline-none text-black"
              />
              <button type="submit" className="bg-indigo-600 text-white px-3">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Link to="/cart" className="relative text-white">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/leaderboard" className="hover:underline">
              🏆 Leaderboard
            </Link>

            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                {isAdmin && <Link to="/admin">Admin</Link>}
                <Link to="/profile">
                  <User className="inline w-5 h-5 mr-1" />
                  Profile
                </Link>
                <button onClick={handleLogout}>
                  <LogOut className="inline w-5 h-5 mr-1" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* ✅ Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ✅ Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around items-center py-2 md:hidden shadow">
        <Link to="/" className="flex flex-col items-center text-xs">
          <Home className="w-5 h-5" />
          Home
        </Link>
        <button
          onClick={() => setShowCategories(true)}
          className="flex flex-col items-center text-xs"
        >
          <LayoutGrid className="w-5 h-5" />
          Categories
        </button>
        <Link
          to="/cart"
          className="flex flex-col items-center text-xs relative"
        >
          <ShoppingCart className="w-5 h-5" />
          Cart
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-xs">
          <User className="w-5 h-5" />
          Account
        </Link>
      </div>

      {/* ✅ Mobile Sidebar Menu with Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-black z-50 shadow-lg p-4 space-y-4"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 mb-4"
              >
                <X className="w-6 h-6" />
              </button>

              <form
                onSubmit={handleSearch}
                className="flex border rounded overflow-hidden"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="px-2 py-1 text-sm outline-none flex-1 text-black"
                />
                <button type="submit" className="bg-indigo-600 text-white px-3">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Home
              </Link>

              <button
                onClick={() => {
                  setShowCategories(true);
                  setMenuOpen(false);
                }}
                className="block text-gray-800"
              >
                Categories ▾
              </button>

              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Cart
              </Link>

              <Link
                to="/leaderboard"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                🏆 Leaderboard
              </Link>
              <Link
                to="/about-us"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                About Us
              </Link>
              <Link
                to="/contact-us"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Contact Us
              </Link>
              <Link
                to="/disclaimer"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Disclaimer
              </Link>
              <Link
                to="/privacy-policy"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800"
              >
                Terms & Condition
              </Link>

              {!token ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-800"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block text-gray-800"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-gray-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Categories Modal */}
      {showCategories && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={() => setShowCategories(false)}
        >
          <div
            className="bg-white p-4 rounded shadow-md max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Categories
            </h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${slugify(cat)}`}
                    onClick={() => setShowCategories(false)}
                    className="block px-3 py-2 text-gray-700 hover:bg-indigo-100 capitalize rounded"
                  >
                    {categoryIcons[cat.toLowerCase()] || null}
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowCategories(false)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
