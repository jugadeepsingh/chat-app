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

const getSender = (chat, currentUser) => {
  if (chat.isGroupChat) return { name: chat.chatName, isGroup: true };
  return chat.users.find((u) => u._id !== currentUser._id) || {};
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
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMsg.chat._id) {
        setNotification((prev) => {
          if (!prev.find((n) => n._id === newMsg._id)) return [newMsg, ...prev];
          return prev;
        });
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }

      setChats((prev) => {
        const updated = prev.map((c) =>
          c._id === newMsg.chat._id ? { ...c, latestMessage: newMsg } : c
        );

        return [
          updated.find((c) => c._id === newMsg.chat._id),
          ...updated.filter((c) => c._id !== newMsg.chat._id),
        ].filter(Boolean);
      });
    });

    return () => {
      socket.off("message received");
    };
  }, [setChats, setNotification]);

  // Fetch messages
  useEffect(() => {
    if (!selectedChat || !socket) return;

    setLoading(true);

    fetchMessagesAPI(selectedChat._id)
      .then(({ data }) => {
        setMessages(data);
        socket.emit("join chat", selectedChat._id);
      })
      .catch(() => {})
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
      socket.emit("typing", selectedChat._id);
    }

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    socket.emit("stop typing", selectedChat._id);

    const content = input.trim();
    setInput("");

    try {
      const { data } = await sendMessageAPI({
        content,
        chatId: selectedChat._id,
      });

      socket.emit("new message", data);

      setMessages((prev) => [...prev, data]);

      setChats((prev) => {
        const updated = prev.map((c) =>
          c._id === data.chat._id ? { ...c, latestMessage: data } : c
        );

        return [
          updated.find((c) => c._id === data.chat._id),
          ...updated.filter((c) => c._id !== data.chat._id),
        ].filter(Boolean);
      });
    } catch {}
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
              ? `${selectedChat.users.length} members`
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
          const isSent = msg.sender?._id === user._id;

          const showName =
            selectedChat.isGroupChat &&
            !isSent &&
            (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);

          return (
            <div key={msg._id || i} className={`message-wrapper ${isSent ? "sent" : ""}`}>
              {!isSent && <Avatar user={msg.sender} size={28} />}

              <div style={{ display: "flex", flexDirection: "column", maxWidth: "65%" }}>
                {showName && <div className="message-sender-name">{msg.sender?.name}</div>}

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