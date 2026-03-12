import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { searchUsersAPI, accessChatAPI, fetchChatsAPI } from "../../utils/api";
import ProfileModal from "../chat/ProfileModal";
import GroupChatModal from "../chat/GroupChatModal";

const Sidebar = () => {
  const { user } = useAuth();
  const { setSelectedChat, chats, setChats, selectedChat } = useChat();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // FIX: wait for user to be loaded before fetching chats
  useEffect(() => {
    if (!user) return; // don't fetch without auth
    const loadChats = async () => {
      try {
        const { data } = await fetchChatsAPI();
        setChats(data);
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    loadChats();
  }, [user]); // depends on user — fires when user is ready

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Search users when debounced value changes
  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return; }
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await searchUsersAPI(debouncedSearch);
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [debouncedSearch]);

  const handleSelectUser = async (userId) => {
    try {
      const { data } = await accessChatAPI(userId);
      setSelectedChat(data);
      setSearchResults([]);
      setSearchText("");
      if (!chats.find((c) => c.id === data.id)) {
        setChats([data, ...chats]);
      }
    } catch (err) {
      console.error("Access chat error:", err);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const other = chat.users?.find((u) => u.id !== user?.id);
    return other?.name || chat.chatName;
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>💬 ChatApp</h2>
        <button
          onClick={() => setShowGroupModal(true)}
          title="Create Group Chat"
          style={{
            background: "rgba(102,126,234,0.15)",
            border: "1px solid rgba(102,126,234,0.3)",
            color: "#667eea", borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", fontSize: 13
          }}
        >
          + Group
        </button>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search users..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading && (
        <p style={{ padding: "0 16px", color: "#667eea", fontSize: 13 }}>
          Searching...
        </p>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <p className="search-label">SEARCH RESULTS</p>
          {searchResults.map((u) => (
            <div
              key={u.id}
              className="user-item"
              onClick={() => handleSelectUser(u.id)}
            >
              <img
                src={u.pic}
                alt={u.name}
                className="avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"; }}
              />
              <div>
                <p className="user-name">{u.name}</p>
                <p className="user-email">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chats List — scrollable middle section */}
      {!searchText && (
        <div className="chats-list" style={{ flex: 1, overflowY: "auto" }}>
          {chats.length === 0 && (
            <p style={{ padding: "16px", color: "#475569", fontSize: 13 }}>
              No chats yet. Search for a user to start!
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? "active" : ""}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="chat-item-avatar">
                {getInitials(getChatName(chat))}
              </div>
              <div className="chat-item-info">
                <div className="chat-name">{getChatName(chat)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {chat.isGroupChat
                    ? `👥 ${chat.users?.length} members`
                    : "Click to open chat"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Profile Bar */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          background: "rgba(255,255,255,0.03)",
        }}
        onClick={() => setShowProfile(true)}
      >
        <img
          src={user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
          alt={user?.name}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"; }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {user?.status || "Click to edit profile"}
          </div>
        </div>
        <span style={{ fontSize: 16, color: "#64748b" }}>⚙️</span>
      </div>

      {/* Modals */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showGroupModal && <GroupChatModal onClose={() => setShowGroupModal(false)} />}
    </div>
  );
};

export default Sidebar;