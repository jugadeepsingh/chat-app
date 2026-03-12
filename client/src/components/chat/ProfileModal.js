import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfileAPI } from "../../utils/api";
import Avatar from "../layout/Avatar";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ onClose }) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [pic, setPic] = useState(user?.pic || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await updateProfileAPI({ name, pic });
      login(data); // updates localStorage + state
      setMsg("Profile updated!");
    } catch {
      setMsg("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to login page
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">My Profile</h2>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="profile-avatar">
            <Avatar user={user} size={80} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 18, color: "#e2e8f0" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: "#667eea", marginTop: 4 }}>
            {user?.email}
          </div>
        </div>

        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Profile Picture URL</label>
          <input
            value={pic}
            onChange={(e) => setPic(e.target.value)}
            placeholder="Paste image URL..."
          />
          {pic && (
            <img
              src={pic}
              alt="preview"
              style={{
                width: 48, height: 48, borderRadius: "50%",
                marginTop: 8, objectFit: "cover"
              }}
            />
          )}
        </div>

        {msg && (
          <div style={{
            color: msg.includes("failed") ? "#f87171" : "#4ade80",
            fontSize: 13, marginBottom: 8, textAlign: "center"
          }}>
            {msg}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn-primary"
            onClick={handleUpdate}
            disabled={loading}
            style={{ flex: 1, marginTop: 0 }}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="divider" />

        <button
          className="btn-secondary"
          onClick={handleLogout}
          style={{ width: "100%", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;