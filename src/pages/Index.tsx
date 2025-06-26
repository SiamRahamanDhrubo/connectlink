
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
}

const Index = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const mockChats: Chat[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      lastMessage: "Hey! How's your day going?",
      timestamp: "2:34 PM",
      unread: 2,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      isOnline: true
    },
    {
      id: "2", 
      name: "Tech Team",
      lastMessage: "The new feature is ready for testing",
      timestamp: "1:15 PM",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop&crop=face",
      isOnline: false
    },
    {
      id: "3",
      name: "Alex Chen",
      lastMessage: "Thanks for the help earlier!",
      timestamp: "11:30 AM", 
      unread: 1,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      isOnline: true
    },
    {
      id: "4",
      name: "Design Squad",
      lastMessage: "New mockups are in the shared folder",
      timestamp: "Yesterday",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      isOnline: false
    }
  ];

  return (
    <div className="h-screen flex bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        chats={mockChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatArea chat={selectedChat} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default Index;
