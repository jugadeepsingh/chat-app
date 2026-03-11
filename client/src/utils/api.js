import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://chat-app-1-9di1.onrender.com"
      : "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("chatapp-user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;

// User APIs
export const registerAPI = (data) => API.post("/api/users/register", data);
export const loginAPI = (data) => API.post("/api/users/login", data);
export const searchUsersAPI = (search) => API.get(`/api/users?search=${search}`);
export const updateProfileAPI = (data) => API.put("/api/users/profile", data);

// Chat APIs
export const accessChatAPI = (userId) => API.post("/api/chats", { userId });
export const fetchChatsAPI = () => API.get("/api/chats");
export const createGroupChatAPI = (data) => API.post("/api/chats/group", data);
export const renameGroupAPI = (data) => API.put("/api/chats/group/rename", data);
export const addToGroupAPI = (data) => API.put("/api/chats/group/add", data);
export const removeFromGroupAPI = (data) => API.put("/api/chats/group/remove", data);

// Message APIs
export const sendMessageAPI = (data) => API.post("/api/messages", data);
export const fetchMessagesAPI = (chatId) => API.get(`/api/messages/${chatId}`);
