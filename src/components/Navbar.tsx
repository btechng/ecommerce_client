import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Monitor, Shirt, Home, ShoppingCart } from "lucide-react";
import axios from "axios";

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
    alert("Logged out successfully.");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b shadow-sm z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600 tracking-wide"
        >
          NgStore
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`hover:text-indigo-600 ${
              isActive("/") ? "text-indigo-600 font-semibold" : "text-gray-700"
            }`}
          >
            Home
          </Link>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`hover:text-indigo-600 ${
                location.pathname.startsWith("/category")
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              Categories ▾
            </button>
            {showCategories && (
              <div className="absolute top-8 left-0 w-56 bg-white border shadow-lg rounded z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat.toLowerCase()}`}
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

          {/* 🔍 Search bar */}
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

          {/* 🛒 Cart with Badge */}
          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-indigo-600"
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
              <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-indigo-600"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin" className="text-gray-700 hover:text-indigo-600">
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 flex flex-col space-y-3">
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
                  to={`/category/${cat.toLowerCase()}`}
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
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
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
