import React, { useState, useEffect } from "react";
import { searchUsersAPI, createGroupChatAPI } from "../../utils/api";
import { useChat } from "../../context/ChatContext";
import Avatar from "../layout/Avatar";

const GroupChatModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { setChats, setSelectedChat } = useChat();

  // Debounce: wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Only call API when debouncedSearch changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await searchUsersAPI(debouncedSearch);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [debouncedSearch]);

  // FIX: use u.id instead of u._id (Sequelize returns id not _id)
  const toggleUser = (user) => {
    if (selected.find((u) => u.id === user.id)) {
      setSelected(selected.filter((u) => u.id !== user.id));
    } else {
      setSelected([...selected, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { alert("Enter a group name"); return; }
    if (selected.length < 2) { alert("Add at least 2 members"); return; }
    setCreating(true);
    try {
      // FIX: send u.id not u._id
      const { data } = await createGroupChatAPI({
        name: groupName,
        users: JSON.stringify(selected.map((u) => u.id)),
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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Selected users tags */}
        {selected.length > 0 && (
          <div className="selected-users">
            {selected.map((u) => (
              <div key={u.id} className="user-tag">
                {u.name}
                <button onClick={() => toggleUser(u)}>×</button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ color: "#667eea", fontSize: 13, padding: "8px 0" }}>
            Searching...
          </div>
        )}

        {/* Search results — only show users not already selected */}
        {results
          .filter((u) => !selected.find((s) => s.id === u.id))
          .map((u) => (
            <div
              key={u.id}
              className="user-search-result"
              onClick={() => toggleUser(u)}
            >
              <Avatar user={u} size={36} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>
                  {u.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div>
              </div>
            </div>
          ))}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating}
            style={{ flex: 1, marginTop: 0 }}
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;