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
  category: string;
  reviews?: Review[];
  rating?: number;
  numReviews?: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const [hasReviewed, setHasReviewed] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`https://ecommerce-server-or19.onrender.com/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        // Check if already reviewed by user (only works if backend returns userId match info)
        const userId = localStorage.getItem("userId");
        const already = res.data.reviews?.some((r: any) => r.userId === userId);
        setHasReviewed(already || false);
      })
      .catch(() => alert("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  const handleReviewSubmit = async () => {
    if (!token) return alert("Please login to submit review");

    try {
      await axios.post(
        `https://ecommerce-server-or19.onrender.com/api/products/${id}/reviews`,
        { comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted!");
      setHasReviewed(true);
      setComment("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit review");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!product) return <div className="p-6 text-center">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.imageUrl || "https://via.placeholder.com/400"}
          alt={product.name}
          className="w-full md:w-1/2 rounded shadow"
        />
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <p className="text-indigo-600 font-semibold text-xl mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="mb-2">
            <strong>Category:</strong> {product.category}
          </p>
          <p className="mb-2">
            <strong>Rating:</strong>{" "}
            {product.rating?.toFixed(1) || "No ratings yet"} (
            {product.numReviews || 0} reviews)
          </p>
          <button
            onClick={handleAddToCart}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <hr className="my-8" />

      <div>
        <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <p className="font-semibold">
                ⭐ {review.rating} - {review.user}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {token && !hasReviewed && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Leave a Review</h4>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full border p-2 mb-2"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Terrible</option>
          </select>
          <textarea
            className="w-full border p-2 mb-2"
            rows={3}
            placeholder="Your comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={handleReviewSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}
      {hasReviewed && (
        <p className="mt-4 text-green-600 font-semibold">
          ✅ You have already reviewed this product.
        </p>
      )}
    </div>
  );
}
