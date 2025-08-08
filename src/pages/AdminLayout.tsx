import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Products", to: "/admin/products", icon: <Package size={18} /> },
    {
      label: "Add Product",
      to: "/admin/add-product",
      icon: <Plus size={18} />,
    },
    { label: "Orders", to: "/admin/orders", icon: <ClipboardList size={18} /> },
    { label: "Users", to: "/admin/users", icon: <Users size={18} /> },
    {
      label: "Data Requests",
      to: "/admin/data-requests",
      icon: <ClipboardList size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-md p-4 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block`}
      >
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)} // Close on click (mobile)
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-md transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            handleLogout();
            setSidebarOpen(false);
          }}
          className="mt-10 flex items-center gap-2 text-red-600 hover:underline"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-24 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
