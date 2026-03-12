import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { searchUsersAPI, accessChatAPI, fetchChatsAPI } from "../../utils/api";

const Sidebar = () => {
  const { user } = useAuth();
  const { setSelectedChat, chats, setChats, selectedChat } = useChat();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load chats once on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await fetchChatsAPI();
        setChats(data);
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    loadChats();
  }, []);

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

  // Get the other person's name in a 1-on-1 chat
  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const other = chat.users?.find((u) => u.id !== user?.id);
    return other?.name || chat.chatName;
  };

  // Get avatar initials
  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ChatApp</h2>
      </div>

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
              <img src={u.pic} alt={u.name} className="avatar" />
              <div>
                <p className="user-name">{u.name}</p>
                <p className="user-email">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chats List */}
      {!searchText && (
        <div className="chats-list">
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
                {chat.isGroupChat && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {chat.users?.length} members
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;