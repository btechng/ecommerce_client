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
  LayoutDashboard,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

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
  const [username, setUsername] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);

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

    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("Logged out successfully.");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <motion.img
            src="https://lh3.googleusercontent.com/d/1XhHYygaVSvHitgWS3DCqg2rFyFrPobA0"
            alt="Logo"
            className="h-10 w-auto object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{
              scale: [1, 1.1, 0.95, 1.05, 1],
              transition: { duration: 0.6 },
            }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`hover:text-indigo-600 ${
              isActive("/") ? "text-indigo-600 font-semibold" : "text-white"
            }`}
          >
            Home
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`hover:text-indigo-500 ${
                location.pathname.startsWith("/category")
                  ? "text-indigo-600 font-semibold"
                  : "text-white"
              }`}
            >
              Categories ▾
            </button>
            {showCategories && (
              <div className="absolute top-8 left-0 w-56 bg-white border shadow-lg rounded z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${slugify(cat)}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 capitalize"
                    onClick={() => setShowCategories(false)}
                  >
                    {categoryIcons[cat.toLowerCase()] || null}
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSearch}
            className="flex border rounded overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 text-sm outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3">
              Go
            </button>
          </form>

          <Link
            to="/cart"
            className="relative text-white hover:text-indigo-400"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {!token ? (
            <>
              <Link to="/login" className="text-white hover:text-indigo-400">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-indigo-400">
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center text-white space-x-2 focus:outline-none"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${username}&background=4f46e5&color=fff&rounded=true`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden lg:inline-block">Hi, {username}</span>
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100"
                  >
                    <User className="inline mr-1 w-4 h-4" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAvatarOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100"
                    >
                      <LayoutDashboard className="inline mr-1 w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="inline mr-1 w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 px-4 pb-4 flex flex-col space-y-3 text-black">
          <form
            onSubmit={handleSearch}
            className="flex border rounded overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 text-sm w-full outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3">
              Go
            </button>
          </form>

          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <div className="pl-2">
            <span className="text-gray-700 font-medium">Categories</span>
            <div className="ml-2 flex flex-col space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${slugify(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="capitalize"
                >
                  {categoryIcons[cat.toLowerCase()] || null}
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Cart {cartCount > 0 && <span>({cartCount})</span>}
          </Link>

          {!token ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-700">Hi, {username}</span>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
