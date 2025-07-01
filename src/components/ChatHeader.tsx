
import { Phone, Video, MoreVertical } from "lucide-react";
import { Chat } from "@/pages/Index";

interface ChatHeaderProps {
  chat: Chat;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export const ChatHeader = ({ chat, onVoiceCall, onVideoCall }: ChatHeaderProps) => {
  return (
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
          onClick={onVoiceCall}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Voice Call"
        >
          <Phone className="w-5 h-5 text-slate-400" />
        </button>
        <button 
          onClick={onVideoCall}
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
  );
};
