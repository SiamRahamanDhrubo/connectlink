
import { useState, useRef } from "react";
import { Paperclip, X, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File, type: 'image' | 'file') => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileSelect, disabled = false }: FileUploadProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, 'image');
      setShowOptions(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, 'file');
      setShowOptions(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled}
        className="p-2 hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5 text-slate-400" />
      </button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-2 space-y-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-2 w-full p-2 hover:bg-slate-600 rounded text-sm text-white"
          >
            <Image className="w-4 h-4" />
            Upload Image
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 w-full p-2 hover:bg-slate-600 rounded text-sm text-white"
          >
            <File className="w-4 h-4" />
            Upload File
          </button>
          <div className="border-t border-slate-600 pt-1">
            <button
              onClick={() => setShowOptions(false)}
              className="flex items-center gap-2 w-full p-2 hover:bg-slate-600 rounded text-sm text-slate-400"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
