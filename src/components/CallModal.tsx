
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState } from "react";

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  contactAvatar: string;
  callType: "voice" | "video";
}

export const CallModal = ({ open, onOpenChange, contactName, contactAvatar, callType }: CallModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onOpenChange(false);
      setCallStatus("connecting");
    }, 1000);
  };

  const getCallStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "ended":
        return "Call ended";
      default:
        return "Connecting...";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 p-0">
        <div className="relative h-[600px] flex flex-col">
          {/* Call Header */}
          <DialogHeader className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={contactAvatar}
                alt={contactName}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <DialogTitle className="text-white text-xl">{contactName}</DialogTitle>
                <p className="text-slate-400 mt-1">{getCallStatusText()}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Video Area (for video calls) */}
          {callType === "video" && (
            <div className="flex-1 bg-slate-800 mx-6 rounded-lg flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Video is off</p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Video preview would appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div className="p-6 flex justify-center space-x-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-full p-4 ${
                isMuted 
                  ? "bg-red-500 hover:bg-red-600 border-red-500" 
                  : "bg-slate-700 hover:bg-slate-600 border-slate-600"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {callType === "video" && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`rounded-full p-4 ${
                  isVideoOff 
                    ? "bg-red-500 hover:bg-red-600 border-red-500" 
                    : "bg-slate-700 hover:bg-slate-600 border-slate-600"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>
            )}

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full p-4 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
