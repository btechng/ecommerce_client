import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PublicAddProduct() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `Hello, I'd like to list a product:\n\nName: ${name}\nEmail: ${email}\nProduct: ${product}\nLocation: ${location}\nDescription: ${description}`;
    const phone = "2348148494924";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    toast.success("Redirecting to WhatsApp...");

    // Clear form
    setName("");
    setEmail("");
    setLocation("");
    setProduct("");
    setDescription("");

    // Open WhatsApp and navigate home after 1.5s
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      navigate("/");
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Sell Your Product
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 space-y-4"
      >
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Product Name"
          className="w-full border p-2 rounded"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <textarea
          placeholder="Product Description"
          className="w-full border p-2 rounded"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Send via WhatsApp
        </button>
      </form>
    </div>
  );
}
