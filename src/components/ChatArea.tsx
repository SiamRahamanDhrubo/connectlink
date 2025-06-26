
import { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { Chat, Message } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  chat: Chat;
}

export const ChatArea = ({ chat }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! How's your day going?",
      timestamp: "2:34 PM",
      isOwn: false,
      avatar: chat.avatar
    },
    {
      id: "2", 
      text: "It's going great! Just finished the new ConnectLink features. The interface is looking amazing! 🚀",
      timestamp: "2:35 PM",
      isOwn: true
    },
    {
      id: "3",
      text: "That's awesome! Can't wait to see what you've built. ConnectLink is going to be revolutionary!",
      timestamp: "2:36 PM", 
      isOwn: false,
      avatar: chat.avatar
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">{chat.name}</h2>
            <p className="text-sm text-slate-400">
              {chat.isOnline ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isOwn ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] px-4 py-2 rounded-2xl shadow-lg",
                message.isOwn
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                  : "bg-slate-700 text-white rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={cn(
                "text-xs mt-1",
                message.isOwn ? "text-blue-100" : "text-slate-400"
              )}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-slate-400"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={cn(
              "p-3 rounded-xl transition-all duration-200",
              newMessage.trim()
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
