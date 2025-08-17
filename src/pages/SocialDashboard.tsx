import React, { useEffect, useState, useRef } from "react";
import { socialApi } from "../api/socialBlogApi";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Share2 } from "lucide-react";
import ChatSelect from "./ChatSelect";
import { Link } from "react-router-dom";

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

const SocialDashboard: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChatSelect, setShowChatSelect] = useState(false);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const token = localStorage.getItem("socialToken");
  const POSTS_PER_PAGE = 15;

  // ✅ if not logged in, show login/register prompt
  if (!token || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">🔒 Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login or create an account to view this post.
          </p>

          {/* 👇 Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load posts with pagination
  const loadPosts = async (nextPage: number) => {
    if (!token) return;
    try {
      const res = await socialApi.get("/posts", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: nextPage, limit: POSTS_PER_PAGE },
      });
      const newPosts = res.data?.data || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  // Load chat users
  const loadUsers = async () => {
    if (!token) return;
    try {
      const res = await socialApi.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatUsers(res.data?.filter((u: User) => u._id !== user?._id) || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  // Initialize Socket.IO
  useEffect(() => {
    loadPosts(page);
    loadUsers();

    socketRef.current = io(
      import.meta.env.VITE_SOCIAL_BLOG_BASE ||
        "https://social-blog-server-6g7j.onrender.com"
    );

    if (user?._id) socketRef.current.emit("join", user._id);

    socketRef.current.on("post:new", (p: Post) =>
      setPosts((prev) => [p, ...prev])
    );
    socketRef.current.on("post:like", (p: Post) =>
      setPosts((prev) => prev.map((x) => (x._id === p._id ? p : x)))
    );
    socketRef.current.on("post:comment", (p: Post) =>
      setPosts((prev) => prev.map((x) => (x._id === p._id ? p : x)))
    );

    return (): void => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  // Create post
  const handlePost = async () => {
    if (!newTitle || !newContent || !token) return;
    setLoading(true);
    try {
      let imageUrl = "";
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("upload_preset", "social_blog_upload");
        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dkjvfszog/image/upload",
          { method: "POST", body: formData }
        );
        const cloudData = await cloudRes.json();
        imageUrl = cloudData.secure_url;
      }

      const res = await socialApi.post(
        "/posts",
        { title: newTitle, content: newContent, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socketRef.current?.emit("post:new", res.data);
      setPosts((prev) => [res.data, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Like post
  const handleLike = async (p: Post) => {
    if (!token) return;
    try {
      const res = await socialApi.post(
        `/posts/${p._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socketRef.current?.emit("post:like", res.data);
      setPosts((prev) => prev.map((x) => (x._id === p._id ? res.data : x)));
    } catch (err) {
      console.error(err);
    }
  };

  // Send comment safely
  const handleComment = async (postId: string) => {
    const content = commentText[postId]?.trim();
    if (!token || !content) return;

    try {
      const res = await socialApi.post(
        `/comments/post/${postId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), res.data] }
            : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to send comment", err);
    }
  };

  // Share post
  const handleShare = (p: Post) => {
    const postUrl = `${window.location.origin}/posts/${p._id}`;
    navigator.clipboard.writeText(postUrl);
    alert("Post link copied!");
  };

  // Chat messages
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    socketRef.current?.emit("dm:join", { me: user._id, other: activeChat._id });

    const handler = (msg: Message) => {
      if (
        [msg.from, msg.to].includes(user._id) &&
        [msg.from, msg.to].includes(activeChat._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketRef.current?.on("dm:new", handler);
    return (): void => {
      socketRef.current?.off("dm:new", handler);
    };
  }, [activeChat, user?._id]);

  const sendMessage = async () => {
    if (!text.trim() || !activeChat || !token) return;
    try {
      const res = await socialApi.post(
        `/chat/${activeChat._id}`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Feed & Post Editor */}
      <div className="md:col-span-2 space-y-4">
        {/* Post Editor */}
        <div className="p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-bold mb-2">Create Post</h2>
          <input
            className="w-full border p-2 rounded mb-2"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded mb-2"
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setNewImage(e.target.files[0]);
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="mb-2"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mb-2 max-h-60 object-contain"
            />
          )}
          <button
            onClick={handlePost}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p._id} className="border rounded p-4 bg-white shadow">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={p.author?.avatarUrl || "https://placehold.co/32"}
                  className="w-8 h-8 rounded-full"
                  alt="avatar"
                />
                <strong>{p.author?.username}</strong>
              </div>
              <h3 className="font-semibold">{p.title}</h3>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  className="my-2 max-h-80 object-contain w-full"
                  alt="post"
                />
              )}
              <div
                dangerouslySetInnerHTML={{ __html: p.content }}
                className="my-2"
              />

              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handleLike(p)}
                  className={`font-semibold ${
                    p.likes.includes(user?._id!) ? "text-red-500" : ""
                  }`}
                >
                  ❤ {p.likes.length}
                </button>
                <button
                  onClick={() => handleShare(p)}
                  className="flex items-center gap-1 text-blue-600"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>

              {/* Comments */}
              <div className="space-y-1 mt-2">
                {(p.comments || []).map((c) => (
                  <div key={c._id} className="text-sm bg-gray-100 p-1 rounded">
                    <strong>@{c.author.username}</strong>: {c.content}
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    value={commentText[p._id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [p._id]: e.target.value,
                      }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 border p-1 rounded text-sm"
                  />
                  <button
                    onClick={() => handleComment(p._id)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* See More Button */}
          {hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={loadMorePosts}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                See More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hover Chat Button: Middle Right */}
      <div className="fixed right-5 top-1/2 transform -translate-y-1/2">
        <button
          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          onClick={() => setShowChatSelect(true)}
        >
          <MessageCircle />
        </button>
      </div>
      {/* Chat Select Modal */}
      {showChatSelect && (
        <ChatSelect
          users={chatUsers || []}
          onClose={() => setShowChatSelect(false)}
          onSelect={(u: User) => {
            setActiveChat(u);
            setShowChatSelect(false);
          }}
        />
      )}
    </div>
  );
};

export default SocialDashboard;
