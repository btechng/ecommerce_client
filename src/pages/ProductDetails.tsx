import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`https://ecommerce-server-or19.onrender.com/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!comment.trim()) {
      alert("Comment is required");
      return;
    }

    try {
      await axios.post(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}/reviews`,
        { comment, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Review submitted!");
      setComment("");
      setRating(5);

      // Refresh product
      const res = await axios.get(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}`
      );
      setProduct(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit review");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={product.imageUrl || "https://via.placeholder.com/400"}
          alt={product.name}
          className="w-full h-auto rounded shadow"
        />

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>
          <p className="text-xl text-indigo-600 font-semibold mb-2">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 mb-4">{product.description}</p>

          {product.rating && (
            <p className="text-yellow-600 mb-2">
              ⭐ {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </p>
          )}

          {product.location && (
            <p className="text-sm text-gray-600">
              📍 <strong>Location:</strong> {product.location}
            </p>
          )}

          {product.phoneNumber && (
            <>
              <p className="text-sm text-gray-600">
                📞 <strong>Phone:</strong> {product.phoneNumber}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <a
                  href={`tel:${product.phoneNumber}`}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Message on WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((r, idx) => (
              <div key={idx} className="border p-3 rounded shadow-sm">
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

      {/* Review form */}
      {token && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-2">Leave a Review</h3>
          <textarea
            className="w-full border p-2 mb-2"
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
