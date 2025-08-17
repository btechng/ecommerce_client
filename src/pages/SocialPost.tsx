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

interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
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

  // Initialize Socket.IO for real-time comments
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
      // Update local post state
      setPost((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), res.data] }
          : prev
      );
      setCommentText("");

      // Emit via socket for real-time update
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

  if (!post) return <div className="text-center p-4">Loading post...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="border rounded p-4 bg-white shadow">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={post.author.avatarUrl || "https://placehold.co/32"}
            className="w-8 h-8 rounded-full"
            alt="avatar"
          />
          <strong>{post.author.username}</strong>
        </div>

        <h2 className="font-bold text-xl">{post.title}</h2>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="post"
            className="my-2 max-h-80 w-full object-contain"
          />
        )}

        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="my-2"
        />

        <button
          onClick={handleLike}
          className={`font-semibold ${
            post.likes.includes(user?._id!) ? "text-red-500" : ""
          }`}
        >
          ❤ {post.likes.length}
        </button>

        {/* Comments Section */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Comments</h3>
          {(post.comments || []).map((c) => (
            <div key={c._id} className="text-sm bg-gray-100 p-2 rounded">
              <strong>@{c.author.username}</strong>: {c.content}
            </div>
          ))}

          <div className="flex gap-2 mt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border p-1 rounded text-sm"
            />
            <button
              onClick={handleComment}
              className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPost;
