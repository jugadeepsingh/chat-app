import React from "react";

const Avatar = ({ user, size = 44 }) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {user?.image ? (
        <img src={user.image} alt={user.name} />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;
