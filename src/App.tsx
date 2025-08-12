import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import GA4Tracker from "./components/GA4Tracker";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CategoryPage from "./pages/CategoryPage";
import CategoryPageProductOnly from "./pages/CategoryPageProductOnly";
import ProductDetails from "./pages/ProductDetails";
import PublicAddProduct from "./pages/PublicAddProduct";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Disclaimer from "./pages/Disclaimer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import PostJob from "./pages/PostJob";
import CVBuilder from "./pages/CVBuilder";
import Leaderboard from "./pages/Leaderboard";

// User Pages
import UserProfile from "./pages/UserProfile";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

// Admin Pages

import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import ProductEdit from "./pages/ProductEdit";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserList from "./pages/UserList";
import OrderList from "./pages/OrderList";
import ProductList from "./pages/ProductList";
import AdminLayout from "./pages/AdminLayout";
import MyOrders from "./pages/MyOrders";
import PostProduct from "./pages/PostProduct";
import SuccessCallback from "./pages/SuccessCallback";
import AdminDataRequests from "./pages/AdminDataRequests";
import AdminRequests from "./pages/AdminRequests";
import TransactionsList from "./pages/TransactionsList";

const App = () => {
  return (
    <>
      <Navbar />
      <GA4Tracker />

      <Routes>
        {/* 🔓 Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route
          path="/category/products"
          element={<CategoryPageProductOnly />}
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/add-product" element={<PublicAddProduct />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/build-cv" element={<CVBuilder />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/post-product" element={<PostProduct />} />
        <Route path="/wallet/callback" element={<SuccessCallback />} />

        {/* 📄 Static Info */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* 🔒 User Protected Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />

        {/* 🔐 Admin Layout with Nested Protected Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit/:id" element={<ProductEdit />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="data-requests" element={<AdminDataRequests />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="users" element={<UserList />} />
          <Route path="transactions" element={<TransactionsList />} />
        </Route>
      </Routes>

      <Footer />
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default App;
