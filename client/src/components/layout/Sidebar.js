import React, { useState, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { searchUsersAPI, accessChatAPI, fetchChatsAPI } from "../../utils/api";

const Sidebar = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { setSelectedChat, chats, setChats } = useChat();

  // Load all chats on mount — only once
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
  }, []); // <-- empty array = runs ONCE only, fixes the loop

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Call search API only when debounced value changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await searchUsersAPI(debouncedSearch); // uses api.js interceptor
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
      const { data } = await accessChatAPI(userId); // uses api.js interceptor
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

      {loading && <p style={{ padding: "0 16px" }}>Searching...</p>}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <p className="search-label">SEARCH RESULTS</p>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="user-item"
              onClick={() => handleSelectUser(user.id)}
            >
              <img src={user.pic} alt={user.name} className="avatar" />
              <div>
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Chats List — only shown when not searching */}
      {!searchText && chats.length > 0 && (
        <div className="chats-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="chat-name">
                {chat.isGroupChat
                  ? chat.chatName
                  : chat.users?.find(
                      (u) =>
                        u.id !==
                        JSON.parse(localStorage.getItem("chatapp-user"))?.id
                    )?.name || chat.chatName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;