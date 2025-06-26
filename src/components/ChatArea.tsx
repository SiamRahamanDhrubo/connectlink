
import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Phone, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat, Message } from "@/pages/Index";

interface ChatAreaProps {
  chat: Chat;
}

export const ChatArea = ({ chat }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chat.conversation_id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id(display_name, avatar_url)
        `)
        .eq('conversation_id', chat.conversation_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Transform data to match Message interface
      const transformedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: msg.sender_id === user.id,
        avatar: msg.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        sender_id: msg.sender_id
      }));

      return transformedMessages;
    },
    enabled: !!user && !!chat.conversation_id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chat.conversation_id,
          sender_id: user.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chat.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      sendMessageMutation.mutate(newMessage.trim());
      setNewMessage("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-800">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
        <div className="flex items-center gap-3">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-white">{chat.name}</h2>
            <p className="text-sm text-slate-400">
              {chat.isOnline ? "Active now" : "Last seen recently"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-400 mb-2">No messages yet</p>
              <p className="text-sm text-slate-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.isOwn ? "flex-row-reverse" : ""
              }`}
            >
              {!message.isOwn && (
                <img
                  src={message.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.isOwn
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-slate-700 text-white rounded-bl-md"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
