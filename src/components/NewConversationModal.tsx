
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewConversationModal = ({ open, onOpenChange }: NewConversationModalProps) => {
  const [conversationName, setConversationName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCreateConversation = async () => {
    if (!user || !userEmail.trim()) {
      toast.error("Please enter a user email");
      return;
    }

    setIsLoading(true);
    try {
      // Find the user by email
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userEmail) // This would need to be updated to search by email when available
        .single();

      if (userError) {
        toast.error("User not found. Please check the email address.");
        setIsLoading(false);
        return;
      }

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: conversationName.trim() || null,
          created_by: user.id,
          is_group: false
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: targetUser.id }
        ]);

      if (participantError) throw participantError;

      toast.success("Conversation created successfully!");
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onOpenChange(false);
      setConversationName("");
      setUserEmail("");
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-email" className="text-white">User ID or Email</Label>
            <Input
              id="user-email"
              placeholder="Enter user ID or email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversation-name" className="text-white">Conversation Name (Optional)</Label>
            <Input
              id="conversation-name"
              placeholder="Enter conversation name"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateConversation}
            disabled={isLoading || !userEmail.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
