
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [autoRead, setAutoRead] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, you would save these to localStorage or a database
    localStorage.setItem('chat-settings', JSON.stringify({
      notifications,
      soundEnabled,
      theme,
      fontSize,
      autoRead
    }));
    
    toast.success("Settings saved successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-slate-300">
                Enable notifications
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-slate-300">
                Message sounds
              </Label>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Font size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* Chat Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Chat</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-read" className="text-slate-300">
                Auto-mark messages as read
              </Label>
              <Switch
                id="auto-read"
                checked={autoRead}
                onCheckedChange={setAutoRead}
              />
            </div>
          </div>

          <Separator className="bg-slate-600" />

          {/* About Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">About</h3>
            <div className="text-sm text-slate-400 space-y-1">
              <p>ConnectLink v1.0.0</p>
              <p>Built with React and Supabase</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
