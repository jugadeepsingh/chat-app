import React, { useState } from "react";
import { searchUsersAPI, createGroupChatAPI } from "../../utils/api";
import { useChat } from "../../context/ChatContext";
import Avatar from "../layout/Avatar";

const GroupChatModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { setChats, setSelectedChat } = useChat();

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await searchUsersAPI(val);
      setResults(data);
    } catch {}
    setLoading(false);
  };

  const toggleUser = (user) => {
    if (selected.find((u) => u._id === user._id)) {
      setSelected(selected.filter((u) => u._id !== user._id));
    } else {
      setSelected([...selected, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { alert("Enter a group name"); return; }
    if (selected.length < 2) { alert("Add at least 2 members"); return; }
    setCreating(true);
    try {
      const { data } = await createGroupChatAPI({
        name: groupName,
        users: JSON.stringify(selected.map((u) => u._id)),
      });
      setChats((prev) => [data, ...prev]);
      setSelectedChat(data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group");
    }
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Create Group Chat</h2>

        <div className="form-group">
          <label>Group Name</label>
          <input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Add Members</label>
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
          <div className="selected-users">
            {selected.map((u) => (
              <div key={u._id} className="user-tag">
                {u.name}
                <button onClick={() => toggleUser(u)}>×</button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ color: "#667eea", fontSize: 13, padding: "8px 0" }}>Searching...</div>
        )}

        {results.map((u) => (
          <div
            key={u._id}
            className="user-search-result"
            onClick={() => toggleUser(u)}
            style={{
              background: selected.find((s) => s._id === u._id)
                ? "rgba(102,126,234,0.15)"
                : "",
            }}
          >
            <Avatar user={u} size={36} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{u.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div>
            </div>
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating}
            style={{ flex: 1, marginTop: 0 }}>
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
