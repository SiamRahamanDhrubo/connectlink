import { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Phone, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat, Message } from "@/pages/Index";
import { CallModal } from "@/components/CallModal";
import { MobileChatHeader } from "@/components/MobileChatHeader";
import { FileUpload } from "@/components/FileUpload";
import { FilePreview } from "@/components/FilePreview";

interface ChatAreaProps {
  chat: Chat;
  onBack?: () => void;
  isMobile?: boolean;
}

export const ChatArea = ({ chat, onBack, isMobile = false }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'image' | 'file' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user || !chat.conversation_id) return;

    console.log('Setting up real-time subscription for conversation:', chat.conversation_id);

    const channel = supabase
      .channel(`messages-${chat.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chat.conversation_id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', chat.conversation_id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, chat.conversation_id, queryClient]);

  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chat.conversation_id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching messages for conversation:', chat.conversation_id);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('conversation_id', chat.conversation_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Get profiles for all unique sender IDs
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      if (senderIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', senderIds);

      // Create a map of sender_id to profile
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Transform data to match Message interface
      const transformedMessages: Message[] = data.map((msg) => {
        const profile = profileMap.get(msg.sender_id);
        return {
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.sender_id === user.id,
          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          sender_id: msg.sender_id
        };
      });

      console.log('Fetched messages:', transformedMessages.length);
      return transformedMessages;
    },
    enabled: !!user && !!chat.conversation_id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, fileData }: { content: string; fileData?: { name: string; type: string; data: string } }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Sending message to conversation:', chat.conversation_id);
      
      let messageContent = content;
      if (fileData) {
        messageContent = `${content}\n[File: ${fileData.name}]`;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chat.conversation_id,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chat.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const messageText = newMessage.trim();
    if (!messageText && !selectedFile) return;

    let fileData = null;
    if (selectedFile) {
      // Convert file to base64 for simple storage in message content
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile.file);
      });
      
      fileData = {
        name: selectedFile.file.name,
        type: selectedFile.file.type,
        data: fileContent
      };
    }

    sendMessageMutation.mutate({ 
      content: messageText || `Sent a ${selectedFile?.type || 'file'}`, 
      fileData 
    });
    
    setNewMessage("");
    setSelectedFile(null);
  };

  const handleFileSelect = (file: File, type: 'image' | 'file') => {
    setSelectedFile({ file, type });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleVoiceCall = () => {
    setCallType("voice");
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    setCallType("video");
    setShowCallModal(true);
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
    <>
      <div className="flex-1 flex flex-col bg-slate-800">
        {/* Mobile Header */}
        {isMobile && onBack ? (
          <MobileChatHeader 
            chat={chat} 
            onBack={onBack}
            onCallClick={handleVoiceCall}
            onVideoClick={handleVideoCall}
          />
        ) : (
          /* Desktop Header */
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
              <button 
                onClick={handleVoiceCall}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Voice Call"
              >
                <Phone className="w-5 h-5 text-slate-400" />
              </button>
              <button 
                onClick={handleVideoCall}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Video Call"
              >
                <Video className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}

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

        {/* File Preview */}
        {selectedFile && (
          <div className="p-4 border-t border-slate-700 bg-slate-750">
            <div className="mb-2">
              <FilePreview
                file={selectedFile.file}
                type={selectedFile.type}
                onRemove={handleRemoveFile}
              />
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={sendMessageMutation.isPending}
            />
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
              disabled={(!newMessage.trim() && !selectedFile) || sendMessageMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {sendMessageMutation.isError && (
            <p className="text-red-400 text-sm mt-2">
              Failed to send message. Please try again.
            </p>
          )}
        </form>
      </div>

      {/* Call Modal */}
      <CallModal
        open={showCallModal}
        onOpenChange={setShowCallModal}
        contactName={chat.name}
        contactAvatar={chat.avatar}
        callType={callType}
      />
    </>
  );
};
