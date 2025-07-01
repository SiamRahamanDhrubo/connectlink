
import { useRef, useEffect } from "react";
import { Message } from "@/pages/Index";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
  );
};
