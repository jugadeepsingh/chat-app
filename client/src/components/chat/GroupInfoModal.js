import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
  renameGroupAPI,
  addToGroupAPI,
  removeFromGroupAPI,
  searchUsersAPI,
} from "../../utils/api";
import Avatar from "../layout/Avatar";

const GroupInfoModal = ({ onClose }) => {
  const { user } = useAuth();
  const { selectedChat, setSelectedChat, setChats } = useChat();

  const [groupName, setGroupName] = useState(selectedChat?.chatName || "");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [msg, setMsg] = useState("");

  const isAdmin = selectedChat?.groupAdminId === user?.id;

  const handleSearch = async (val) => {
    setSearchText(val);
    if (!val.trim()) { setSearchResults([]); return; }
    try {
      setLoading(true);
      const { data } = await searchUsersAPI(val);
      // Filter out users already in the group
      setSearchResults(
        data.filter(
          (u) => !selectedChat.users.find((m) => m.id === u.id)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupName.trim()) return;
    try {
      setRenaming(true);
      const { data } = await renameGroupAPI({
        chatId: selectedChat.id,
        chatName: groupName,
      });
      setSelectedChat(data);
      setChats((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      );
      setMsg("Group renamed!");
    } catch {
      setMsg("Rename failed");
    } finally {
      setRenaming(false);
    }
  };

  const handleAdd = async (userId) => {
    try {
      const { data } = await addToGroupAPI({
        chatId: selectedChat.id,
        userId,
      });
      setSelectedChat(data);
      setChats((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      );
      setSearchText("");
      setSearchResults([]);
      setMsg("Member added!");
    } catch {
      setMsg("Failed to add member");
    }
  };

  const handleRemove = async (userId) => {
    try {
      const { data } = await removeFromGroupAPI({
        chatId: selectedChat.id,
        userId,
      });
      setSelectedChat(data);
      setChats((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      );
      setMsg("Member removed!");
    } catch {
      setMsg("Failed to remove member");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Group Info</h2>

        {/* Rename Group — only admin */}
        {isAdmin && (
          <div className="form-group">
            <label>Group Name</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary"
                onClick={handleRename}
                disabled={renaming}
                style={{ marginTop: 0, padding: "0 16px" }}
              >
                {renaming ? "..." : "Rename"}
              </button>
            </div>
          </div>
        )}

        {/* Add Members — only admin */}
        {isAdmin && (
          <div className="form-group">
            <label>Add Members</label>
            <input
              placeholder="Search users to add..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {loading && (
              <div style={{ color: "#667eea", fontSize: 13, marginTop: 4 }}>
                Searching...
              </div>
            )}
            {searchResults.map((u) => (
              <div
                key={u.id}
                className="user-search-result"
                onClick={() => handleAdd(u.id)}
                style={{ cursor: "pointer" }}
              >
                <Avatar user={u} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: 12 }}>
                  + Add
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Current Members */}
        <div className="form-group">
          <label>Members ({selectedChat?.users?.length})</label>
          {selectedChat?.users?.map((member) => (
            <div
              key={member.id}
              className="user-search-result"
              style={{ cursor: "default" }}
            >
              <Avatar user={member} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>
                  {member.name}
                  {member.id === selectedChat.groupAdminId && (
                    <span style={{
                      fontSize: 10, color: "#667eea",
                      background: "rgba(102,126,234,0.15)",
                      padding: "2px 6px", borderRadius: 4, marginLeft: 6
                    }}>
                      Admin
                    </span>
                  )}
                  {member.id === user?.id && (
                    <span style={{ fontSize: 10, color: "#64748b", marginLeft: 4 }}>
                      (You)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{member.email}</div>
              </div>
              {/* Admin can remove others, anyone can remove themselves */}
              {(isAdmin && member.id !== user?.id) && (
                <button
                  onClick={() => handleRemove(member.id)}
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    color: "#f87171", borderRadius: 6,
                    padding: "4px 10px", cursor: "pointer", fontSize: 12
                  }}
                >
                  Remove
                </button>
              )}
              {member.id === user?.id && (
                <button
                  onClick={() => handleRemove(member.id)}
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    color: "#f87171", borderRadius: 6,
                    padding: "4px 10px", cursor: "pointer", fontSize: 12
                  }}
                >
                  Leave
                </button>
              )}
            </div>
          ))}
        </div>

        {msg && (
          <div style={{
            color: msg.includes("fail") ? "#f87171" : "#4ade80",
            fontSize: 13, textAlign: "center", marginBottom: 8
          }}>
            {msg}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;