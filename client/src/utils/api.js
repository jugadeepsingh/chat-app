import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

export default API;

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("chatapp-user") || "null");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// User APIs
export const registerAPI = (data) => API.post("/users/register", data);
export const loginAPI = (data) => API.post("/users/login", data);
export const searchUsersAPI = (search) => API.get(`/users?search=${search}`);
export const updateProfileAPI = (data) => API.put("/users/profile", data);

// Chat APIs
export const accessChatAPI = (userId) => API.post("/chats", { userId });
export const fetchChatsAPI = () => API.get("/chats");
export const createGroupChatAPI = (data) => API.post("/chats/group", data);
export const renameGroupAPI = (data) => API.put("/chats/group/rename", data);
export const addToGroupAPI = (data) => API.put("/chats/group/add", data);
export const removeFromGroupAPI = (data) => API.put("/chats/group/remove", data);

// Message APIs
export const sendMessageAPI = (data) => API.post("/messages", data);
export const fetchMessagesAPI = (chatId) => API.get(`/messages/${chatId}`);
