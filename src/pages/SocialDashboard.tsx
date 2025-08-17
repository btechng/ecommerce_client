// src/pages/SocialDashboard.tsx
import React, { useEffect, useState, useRef } from "react";
import { socialApi } from "../api/socialBlogApi";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

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
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const [text, setText] = useState<string>("");

  const token = localStorage.getItem("socialToken");

  // Load posts
  const loadPosts = async () => {
    if (!token) return;
    try {
      const res = await socialApi.get("/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data?.data || []);
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

  useEffect(() => {
    loadPosts();
    loadUsers();

    // Setup socket.io
    socketRef.current = io(
      import.meta.env.VITE_SOCIAL_BLOG_BASE ||
        "https://social-blog-server-6g7j.onrender.com"
    );

    if (user?._id) {
      socketRef.current.emit("join", user._id);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Post editor
  const handlePost = async () => {
    if (!newTitle || !newContent || !token) return;
    setLoading(true);

    try {
      let imageUrl = "";
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        formData.append("upload_preset", "ml_default"); // Cloudinary preset
        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dkjvfszog/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const cloudData = await cloudRes.json();
        imageUrl = cloudData.secure_url;
      }

      const res = await socialApi.post(
        "/posts",
        { title: newTitle, content: newContent, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([res.data, ...posts]);
      setNewTitle("");
      setNewContent("");
      setNewImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Failed to create post", err);
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
      setPosts(posts.map((x) => (x._id === p._id ? res.data : x)));
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  // Comment post
  const handleComment = async (postId: string) => {
    if (!token || !commentText[postId]?.trim()) return;
    try {
      const res = await socialApi.post(
        `/posts/${postId}/comment`,
        { content: commentText[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), res.data] }
            : p
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      console.error("Failed to comment", err);
    }
  };

  // Chat logic
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    socketRef.current?.emit("dm:join", {
      me: user._id,
      other: activeChat._id,
    });

    const handler = (msg: Message) => {
      if (
        [msg.from, msg.to].includes(user._id) &&
        [msg.from, msg.to].includes(activeChat._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketRef.current?.on("dm:new", handler);
    return () => {
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
      console.error("Failed to send message", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Feed & Post Editor */}
      <div className="md:col-span-2 space-y-4">
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
            placeholder="Content (HTML allowed)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
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

        <div className="space-y-4">
          {(posts || []).map((p) => (
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
              <button
                onClick={() => handleLike(p)}
                className="text-red-500 font-semibold mb-2"
              >
                ❤ {(p.likes || []).length}
              </button>

              {/* Comments */}
              <div className="space-y-1 mt-2">
                {(p.comments || []).map((c) => (
                  <div key={c._id} className="text-sm bg-gray-100 p-1 rounded">
                    <strong>@{c.author?.username}</strong>: {c.content}
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    value={commentText[p._id] || ""}
                    onChange={(e) =>
                      setCommentText({
                        ...commentText,
                        [p._id]: e.target.value,
                      })
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
        </div>
      </div>

      {/* Chat */}
      <div className="p-4 border rounded shadow bg-white flex flex-col h-[80vh]">
        <h2 className="text-xl font-bold mb-2">Chat</h2>
        <div className="flex-1 flex overflow-hidden gap-2">
          {/* Users list */}
          <div className="w-32 border-r overflow-y-auto">
            {(chatUsers || []).map((u) => (
              <div
                key={u._id}
                onClick={() => setActiveChat(u)}
                className={`p-2 cursor-pointer ${
                  activeChat?._id === u._id ? "bg-blue-100" : ""
                }`}
              >
                {u.username}
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 border-b">
              {activeChat ? (
                (messages || []).map((m) => (
                  <div
                    key={m._id}
                    className={`mb-1 ${
                      m.from === user?._id ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="inline-block p-2 rounded bg-gray-100">
                      {m.content}
                    </span>
                  </div>
                ))
              ) : (
                <div>Select a user to chat</div>
              )}
            </div>
            {activeChat && (
              <div className="flex gap-2 mt-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border p-2 rounded"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialDashboard;
