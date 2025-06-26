
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
  conversation_id: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
  sender_id: string;
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch conversations for the current user
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            name,
            is_group,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Transform data to match Chat interface
      const chats: Chat[] = await Promise.all(
        data.map(async (item) => {
          const conv = item.conversations;
          
          // Get the latest message for this conversation
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get other participants to determine chat name and avatar
          const { data: participantsData } = await supabase
            .from('conversation_participants')
            .select(`
              profiles!inner(display_name, avatar_url)
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          const otherParticipant = participantsData?.[0]?.profiles;
          
          return {
            id: conv.id,
            name: conv.name || otherParticipant?.display_name || 'Unknown User',
            lastMessage: lastMessageData?.[0]?.content || 'No messages yet',
            timestamp: lastMessageData?.[0]?.created_at 
              ? new Date(lastMessageData[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Now',
            unread: 0, // TODO: Implement unread count
            avatar: otherParticipant?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            isOnline: false, // TODO: Implement online status
            conversation_id: conv.id
          };
        })
      );

      return chats;
    },
    enabled: !!user,
  });

  if (loading || conversationsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading ConnectLink...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="h-screen flex bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        chats={conversations}
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
