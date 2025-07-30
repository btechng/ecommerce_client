import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Review {
  user: string;
  comment: string;
  rating: number;
  date: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
  location?: string;
  phoneNumber?: string;
  email?: string;
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  const isJobVacancy =
    product?.category?.toLowerCase().replace(/\s+/g, "") === "job/vacancy" ||
    product?.category?.toLowerCase().replace(/\s+/g, "") === "jobvacancy";

  useEffect(() => {
    axios
      .get(`https://ecommerce-server-or19.onrender.com/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);

        const viewed = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]"
        );
        const newItem = {
          _id: res.data._id,
          name: res.data.name,
          description: res.data.description,
          imageUrl: res.data.imageUrl,
          category: res.data.category,
        };

        const updated = [
          newItem,
          ...viewed.filter((item: Product) => item._id !== res.data._id),
        ];

        localStorage.setItem(
          "recentlyViewed",
          JSON.stringify(updated.slice(0, 10))
        );
      })
      .catch(() => {
        toast.error("❌ Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!comment.trim()) return toast.warn("⚠️ Comment is required");
    try {
      await axios.post(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}/reviews`,
        { comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Review submitted!");
      setComment("");
      setRating(5);
      const res = await axios.get(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}`
      );
      setProduct(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "❌ Failed to submit review");
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write("<html><head><title>Print</title></head><body>");
        win.document.write(printRef.current.innerHTML);
        win.document.write("</body></html>");
        win.document.close();
        win.print();
      }
    }
  };

  const handleDownload = () => {
    if (!product) return;
    const content = `
Job Title: ${product.name}
Location: ${product.location}
Description: ${product.description}
Email: ${product.email}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${product.name}_JobDetails.txt`;
    link.click();
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await axios.post(
          "https://ecommerce-server-or19.onrender.com/api/cart",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = existingCart.find(
          (item: any) => item.product._id === product._id
        );

        let updatedCart;
        if (existing) {
          updatedCart = existingCart.map((item: any) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedCart = [...existingCart, { product, quantity: 1 }];
        }

        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }

      toast.success("✅ Added to cart!");
      navigate("/cart");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "❌ Failed to add to cart");
    }
  };

  if (loading) return <div className="p-4 pt-24">Loading...</div>;
  if (!product) return <div className="p-4 pt-24">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-24">
      <div ref={printRef} className="grid md:grid-cols-2 gap-6">
        {!isJobVacancy && (
          <img
            src={product.imageUrl || "https://via.placeholder.com/400"}
            alt={product.name}
            className="w-full h-auto rounded shadow"
          />
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>
          {!isJobVacancy && (
            <p className="text-xl text-indigo-600 font-semibold mb-2">
              ₦{product.price?.toLocaleString() || "Contact"}
            </p>
          )}

          <div className="text-gray-600 mb-4 whitespace-pre-line">
            {expanded || !isJobVacancy
              ? product.description
              : `${product.description.slice(0, 150)}...`}
            {isJobVacancy && product.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 ml-2 underline"
              >
                {expanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          {product.location && (
            <p className="text-sm text-gray-600 mb-2">
              📍 <strong>Location:</strong> {product.location}
            </p>
          )}

          {isJobVacancy && product.email && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                ✉️ <strong>Email:</strong>{" "}
                <a href={`mailto:${product.email}`} className="underline">
                  {product.email}
                </a>
              </p>
              <a
                href={`mailto:${product.email}?subject=Job Application: ${product.name}`}
                className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Apply via Email
              </a>
            </div>
          )}

          {!isJobVacancy && product.phoneNumber && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                📞 <strong>Phone:</strong>{" "}
                <a href={`tel:${product.phoneNumber}`} className="underline">
                  {product.phoneNumber}
                </a>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a
                  href={`tel:${product.phoneNumber}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Call Seller
                </a>
                <a
                  href={`https://wa.me/${product.phoneNumber.replace(
                    /\D/g,
                    ""
                  )}?text=${encodeURIComponent(
                    `Hello, I'm interested in your product: ${product.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  WhatsApp
                </a>
                <button
                  onClick={handleAddToCart}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isJobVacancy && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handlePrint}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleDownload}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            📄 Download
          </button>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="border p-3 rounded shadow-sm">
                <div className="font-bold text-gray-700">{r.user}</div>
                <div className="text-yellow-500">⭐ {r.rating}</div>
                <div className="text-sm text-gray-600">{r.comment}</div>
                <div className="text-xs text-gray-400">
                  {new Date(r.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {token && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-2">Leave a Review</h3>
          <textarea
            className="w-full border p-2 mb-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
          />
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border p-2 mb-2"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleReviewSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
}
