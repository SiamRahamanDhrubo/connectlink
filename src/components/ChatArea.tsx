
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/pages/Index";
import { CallModal } from "@/components/CallModal";
import { MobileChatHeader } from "@/components/MobileChatHeader";
import { ChatHeader } from "@/components/ChatHeader";
import { MessagesList } from "@/components/MessagesList";
import { MessageInput } from "@/components/MessageInput";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatAreaProps {
  chat: Chat;
  onBack?: () => void;
  isMobile?: boolean;
}

export const ChatArea = ({ chat, onBack, isMobile = false }: ChatAreaProps) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const { user } = useAuth();
  
  const { messages, isLoading, sendMessage, isError, isPending } = useChatMessages(chat);

  const handleVoiceCall = () => {
    setCallType("voice");
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    setCallType("video");
    setShowCallModal(true);
  };

  const handleSendMessage = async (content: string, fileData?: { name: string; type: string; data: string }) => {
    if (!user) return;
    await sendMessage(content, fileData);
  };

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
          <ChatHeader
            chat={chat}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
          />
        )}

        {/* Messages Area */}
        <MessagesList messages={messages} isLoading={isLoading} />

        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={isPending}
        />
        
        {/* Error Message */}
        {isError && (
          <div className="p-4 border-t border-slate-700">
            <p className="text-red-400 text-sm">
              Failed to send message. Please try again.
            </p>
          </div>
        )}
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
