import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { fetchChatsAPI, accessChatAPI, searchUsersAPI } from "../../utils/api";
import Avatar from "../layout/Avatar";
import ProfileModal from "../chat/ProfileModal";
import GroupChatModal from "../chat/GroupChatModal";

const getSenderName = (chat, currentUser) => {
  if (chat.isGroupChat) return chat.chatName;
  return chat.users.find((u) => u._id !== currentUser._id)?.name || "Unknown";
};

const getSenderObj = (chat, currentUser) => {
  if (chat.isGroupChat) return { name: chat.chatName };
  return chat.users.find((u) => u._id !== currentUser._id) || {};
};

const Sidebar = () => {
  const { user } = useAuth();
  const { chats, setChats, selectedChat, setSelectedChat, notification, setNotification } = useChat();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchChatsAPI()
      .then(({ data }) => setChats(data))
      .catch(() => {});
  }, [user, setChats]); // ✅ FIXED dependency

  const handleSearch = async (val) => {
    setSearch(val);

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const { data } = await searchUsersAPI(val);
      setSearchResults(data);
    } catch {}

    setSearching(false);
  };

  const handleUserClick = async (u) => {
    try {
      const { data } = await accessChatAPI(u._id);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setSearch("");
      setSearchResults([]);
    } catch {}
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-top">
            <span className="app-logo">💬 ChatApp</span>

            <div style={{ display: "flex", gap: 8 }}>
              <div className="icon-btn-wrapper">
                <button
                  className="icon-btn"
                  onClick={() => setShowGroup(true)}
                  title="New Group"
                >
                  👥
                </button>
              </div>

              <div className="icon-btn-wrapper">
                <button className="icon-btn" title="Notifications">
                  🔔
                </button>

                {notification.length > 0 && (
                  <span className="notification-badge">
                    {notification.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <input
            className="search-input"
            placeholder="Search users or chats..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {search && (
            <>
              <div
                style={{
                  padding: "8px 16px 4px",
                  fontSize: 11,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Search Results
              </div>

              {searching && (
                <div className="empty-chat-list">Searching...</div>
              )}

              {!searching && searchResults.length === 0 && search && (
                <div className="empty-chat-list">No users found</div>
              )}

              {searchResults.map((u) => (
                <div
                  key={u._id}
                  className="chat-item"
                  onClick={() => handleUserClick(u)}
                >
                  <Avatar user={u} />

                  <div className="chat-info">
                    <div className="chat-name">{u.name}</div>
                    <div className="chat-preview">{u.email}</div>
                  </div>
                </div>
              ))}

              <div className="divider" style={{ margin: "8px 0" }} />
            </>
          )}

          {!search && chats.length === 0 && (
            <div className="empty-chat-list">
              Search users above to start chatting
            </div>
          )}

          {chats.map((chat) => {
            const sender = getSenderObj(chat, user);
            const isActive = selectedChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setSelectedChat(chat);
                  setNotification(
                    notification.filter((n) => n.chat._id !== chat._id)
                  );
                }}
              >
                <Avatar user={sender} />

                <div className="chat-info">
                  <div className="chat-name">
                    {getSenderName(chat, user)}
                  </div>

                  <div className="chat-preview">
                    {chat.latestMessage
                      ? `${chat.latestMessage.sender?.name?.split(" ")[0]}: ${
                          chat.latestMessage.content || "📎 File"
                        }`
                      : "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <Avatar user={user} size={36} />

          <span className="user-name-small">{user?.name}</span>

          <button
            className="icon-btn"
            onClick={() => setShowProfile(true)}
            title="Profile"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showGroup && <GroupChatModal onClose={() => setShowGroup(false)} />}
    </>
  );
};

export default Sidebar;