// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-4 mt-10 text-center text-sm text-gray-600">
      <p>© 2025 Task&Cart. All rights reserved.</p>
      <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
        <Link to="/about-us" className="hover:underline">
          About Us
        </Link>
        <Link to="/contact-us" className="hover:underline">
          Contact Us
        </Link>
        <Link to="/disclaimer" className="hover:underline">
          Disclaimer
        </Link>
        <Link to="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms & Conditions
        </Link>
      </div>
    </footer>
  );
}
