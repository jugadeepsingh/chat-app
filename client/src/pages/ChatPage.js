import React from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatBox from "../components/chat/ChatBox";
import { ChatProvider } from "../context/ChatContext";

const ChatPage = () => (
  <ChatProvider>
    <div className="app-layout">
      <Sidebar />
      <ChatBox />
    </div>
  </ChatProvider>
);

export default ChatPage;
