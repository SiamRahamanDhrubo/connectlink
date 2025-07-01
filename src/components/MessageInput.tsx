
import { useState } from "react";
import { Send } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { FilePreview } from "@/components/FilePreview";

interface MessageInputProps {
  onSendMessage: (message: string, fileData?: { name: string; type: string; data: string }) => void;
  isLoading: boolean;
}

export const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'image' | 'file' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    onSendMessage(messageText || `Sent a ${selectedFile?.type || 'file'}`, fileData);
    setNewMessage("");
    setSelectedFile(null);
  };

  const handleFileSelect = (file: File, type: 'image' | 'file') => {
    setSelectedFile({ file, type });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <>
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <FileUpload
            onFileSelect={handleFileSelect}
            disabled={isLoading}
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </>
  );
};
