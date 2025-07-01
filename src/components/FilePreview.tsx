
import { X, File, Download } from "lucide-react";

interface FilePreviewProps {
  file: File;
  type: 'image' | 'file';
  onRemove: () => void;
}

export const FilePreview = ({ file, type, onRemove }: FilePreviewProps) => {
  const fileUrl = URL.createObjectURL(file);
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  if (type === 'image') {
    return (
      <div className="relative inline-block max-w-xs">
        <img
          src={fileUrl}
          alt="Preview"
          className="max-h-32 rounded-lg border border-slate-600"
        />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="mt-1 text-xs text-slate-400 truncate max-w-xs">
          {file.name} ({fileSizeMB} MB)
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg p-3 max-w-xs">
      <File className="w-6 h-6 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{file.name}</div>
        <div className="text-xs text-slate-400">{fileSizeMB} MB</div>
      </div>
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-red-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
