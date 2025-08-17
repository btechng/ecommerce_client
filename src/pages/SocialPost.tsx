import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socialApi } from "../api/socialBlogApi";
import { useAuth } from "../context/AuthContext";
import { io, Socket } from "socket.io-client";

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
}

interface Comment {
  _id: string;
  author: User;
  content: string;
}

interface Post {
  _id: string;
  author: User;
  title: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
}

const SocialPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const token = localStorage.getItem("socialToken");
  const socketRef = useRef<Socket | null>(null);

  // Load post
  useEffect(() => {
    const loadPost = async () => {
      if (!token || !postId) return;
      try {
        const res = await socialApi.get(`/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
      } catch (err) {
        console.error("Failed to load post", err);
      }
    };
    loadPost();
  }, [postId, token]);

  // Socket.IO for real-time comments
  useEffect(() => {
    if (!postId || !user?._id) return;

    socketRef.current = io(
      import.meta.env.VITE_SOCIAL_BLOG_BASE ||
        "https://social-blog-server-6g7j.onrender.com"
    );

    socketRef.current.emit("join", user._id);
    socketRef.current.emit("post:join", postId);

    const handleNewComment = (comment: Comment) => {
      setPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), comment] } : prev
      );
    };

    socketRef.current.on("post:comment", handleNewComment);

    return () => {
      socketRef.current?.off("post:comment", handleNewComment);
      socketRef.current?.disconnect();
    };
  }, [postId, user?._id]);

  // Send comment
  const handleComment = async () => {
    if (!token || !post || !commentText.trim()) return;

    try {
      const res = await socialApi.post(
        `/comments/post/${post._id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), res.data] }
          : prev
      );
      setCommentText("");
      socketRef.current?.emit("post:comment", res.data);
    } catch (err) {
      console.error("Failed to send comment", err);
    }
  };

  // Like post
  const handleLike = async () => {
    if (!token || !post) return;
    try {
      const res = await socialApi.post(
        `/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data);
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">🔒 Login Required</h2>
          <p className="text-gray-600">
            Please login or create an account to view this post.
          </p>
        </div>
      </div>
    );
  }

  if (!post) return <div className="text-center p-6">Loading post...</div>;

  return (
    <div className="flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl || "https://placehold.co/40"}
            className="w-10 h-10 rounded-full border"
            alt="avatar"
          />
          <div>
            <p className="font-semibold">{post.author.username}</p>
            <p className="text-xs text-gray-500">Shared a post</p>
          </div>
        </div>

        {/* Post Title & Content */}
        <h2 className="text-2xl font-bold text-gray-800">{post.title}</h2>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full rounded-lg shadow max-h-[400px] object-contain"
          />
        )}

        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Likes */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-lg font-semibold ${
            post.likes.includes(user?._id!) ? "text-red-500" : "text-gray-600"
          }`}
        >
          ❤ {post.likes.length}
        </button>

        {/* Comments */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">💬 Comments</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {(post.comments || []).map((c) => (
              <div
                key={c._id}
                className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg"
              >
                <img
                  src={c.author.avatarUrl || "https://placehold.co/32"}
                  className="w-8 h-8 rounded-full border"
                  alt="avatar"
                />
                <div>
                  <p className="font-medium text-sm">@{c.author.username}</p>
                  <p className="text-gray-700 text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border p-2 rounded-lg text-sm focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPost;
