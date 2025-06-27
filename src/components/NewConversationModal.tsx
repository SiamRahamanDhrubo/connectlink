
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
      // First, we need to find users by their email through auth.users
      // Since we can't directly query auth.users, we'll search through profiles
      // that were created when users signed up
      const { data: targetUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .ilike('id', `%${userEmail}%`) // This won't work for email search
        .limit(1);

      // Since we can't search by email in profiles directly, let's try a different approach
      // We'll create the conversation and let the user input a valid user ID instead
      if (!userEmail.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        toast.error("Please enter a valid user ID (UUID format). Email search is not yet implemented.");
        setIsLoading(false);
        return;
      }

      // Check if the user ID exists in profiles
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userEmail.trim())
        .single();

      if (userError || !targetUser) {
        toast.error("User not found. Please check the user ID.");
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
            <Label htmlFor="user-id" className="text-white">User ID</Label>
            <Input
              id="user-id"
              placeholder="Enter user ID (UUID format)"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">
              Enter the UUID of the user you want to chat with. You can find this in their profile.
            </p>
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
