import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { fetchMessagesAPI, sendMessageAPI } from "../../utils/api";
import Avatar from "../layout/Avatar";

const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://chat-app-1-9di1.onrender.com"
    : "http://localhost:5000";

let socket;

// FIX: use .id not ._id
const getSender = (chat, currentUser) => {
  if (chat.isGroupChat) return { name: chat.chatName, isGroup: true };
  return chat.users?.find((u) => u.id !== currentUser.id) || {};
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatBox = () => {
  const { user } = useAuth();
  const { selectedChat, setChats, setNotification } = useChat();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Socket setup
  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Message received
  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMsg) => {
      // FIX: use .id not ._id
      if (
        !selectedChatRef.current ||
        selectedChatRef.current.id !== newMsg.chatId
      ) {
        setNotification((prev) => {
          if (!prev.find((n) => n.id === newMsg.id)) return [newMsg, ...prev];
          return prev;
        });
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }

      setChats((prev) => {
        // FIX: use .id not ._id
        const updated = prev.map((c) =>
          c.id === newMsg.chatId ? { ...c, latestMessageId: newMsg.id } : c
        );
        return [
          updated.find((c) => c.id === newMsg.chatId),
          ...updated.filter((c) => c.id !== newMsg.chatId),
        ].filter(Boolean);
      });
    });

    return () => {
      socket.off("message received");
    };
  }, [setChats, setNotification]);

  // Fetch messages — FIX: use selectedChat.id not selectedChat._id
  useEffect(() => {
    if (!selectedChat?.id || !socket) return;

    setLoading(true);
    fetchMessagesAPI(selectedChat.id)
      .then(({ data }) => {
        setMessages(data);
        socket.emit("join chat", selectedChat.id);
      })
      .catch((err) => console.error("Fetch messages error:", err))
      .finally(() => setLoading(false));
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat.id); // FIX: .id
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat.id); // FIX: .id
      setTyping(false);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChat?.id) return;

    socket.emit("stop typing", selectedChat.id); // FIX: .id

    const content = input.trim();
    setInput("");

    try {
      const { data } = await sendMessageAPI({
        content,
        chatId: selectedChat.id, // FIX: .id
      });

      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);

      setChats((prev) => {
        // FIX: use .id and .chatId
        const updated = prev.map((c) =>
          c.id === data.chatId ? { ...c, latestMessageId: data.id } : c
        );
        return [
          updated.find((c) => c.id === data.chatId),
          ...updated.filter((c) => c.id !== data.chatId),
        ].filter(Boolean);
      });
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!selectedChat) {
    return (
      <div className="chat-area">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h2>Welcome to ChatApp</h2>
          <p>Select a chat or search for a user to start messaging</p>
        </div>
      </div>
    );
  }

  const sender = getSender(selectedChat, user);

  return (
    <div className="chat-area">
      <div className="chat-header">
        <Avatar user={sender} />
        <div className="chat-header-info">
          <div className="chat-header-name">{sender.name}</div>
          <div className="chat-header-status">
            {sender.isGroup
              ? `${selectedChat.users?.length} members`
              : isTyping
              ? "typing..."
              : "online"}
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading && (
          <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 20 }}>
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 20 }}>
            No messages yet. Say hello! 👋
          </div>
        )}

        {messages.map((msg, i) => {
          // FIX: use .id not ._id
          const isSent = msg.sender?.id === user.id;

          const showName =
            selectedChat.isGroupChat &&
            !isSent &&
            (i === 0 || messages[i - 1]?.sender?.id !== msg.sender?.id);

          return (
            <div key={msg.id || i} className={`message-wrapper ${isSent ? "sent" : ""}`}>
              {!isSent && <Avatar user={msg.sender} size={28} />}

              <div style={{ display: "flex", flexDirection: "column", maxWidth: "65%" }}>
                {showName && (
                  <div className="message-sender-name">{msg.sender?.name}</div>
                )}
                <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
                  {msg.content}
                </div>
                <div className="message-time">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}

        {isTyping && <div className="typing-indicator">typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;