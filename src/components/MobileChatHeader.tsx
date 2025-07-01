
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Chat } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface MobileChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onCallClick?: () => void;
  onVideoClick?: () => void;
}

export const MobileChatHeader = ({ chat, onBack, onCallClick, onVideoClick }: MobileChatHeaderProps) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 hover:bg-slate-700 rounded-lg transition-colors -ml-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
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
      
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-white truncate">{chat.name}</h2>
        <p className="text-xs text-slate-400">
          {chat.isOnline ? "Online" : "Last seen recently"}
        </p>
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={onCallClick}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Voice Call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={onVideoClick}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="More Options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
