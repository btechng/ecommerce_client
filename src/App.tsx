// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import ProductEdit from "./pages/ProductEdit";
import PublicAddProduct from "./pages/PublicAddProduct";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Disclaimer from "./pages/Disclaimer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostJob from "./pages/PostJob";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/admin/edit/:id" element={<ProductEdit />} />
        <Route path="/add-product" element={<PublicAddProduct />} />

        {/* Static informational pages */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/post-job" element={<PostJob />} />
      </Routes>

      {/* ✅ Always-visible footer */}
      <Footer />

      {/* Toasts */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default App;
