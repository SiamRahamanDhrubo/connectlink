
import { useState } from "react";
import { User, UserPlus, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string | null;
}

interface UserTagCardProps {
  profile: UserProfile;
  onStartConversation?: () => void;
}

export const UserTagCard = ({ profile, onStartConversation }: UserTagCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleStartConversation = async () => {
    if (!user || user.id === profile.id) return;

    setIsLoading(true);
    try {
      // Check if conversation already exists between these users
      const { data: existingConversation } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            is_group,
            conversation_participants!inner(user_id)
          )
        `)
        .eq('user_id', user.id);

      // Find if there's already a direct conversation with this user
      const directConversation = existingConversation?.find(conv => {
        const participants = conv.conversations.conversation_participants;
        return participants.length === 2 && 
               participants.some(p => p.user_id === profile.id) &&
               !conv.conversations.is_group;
      });

      if (directConversation) {
        toast.success("Conversation already exists!");
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        onStartConversation?.();
        return;
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
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
          { conversation_id: conversation.id, user_id: profile.id }
        ]);

      if (participantError) throw participantError;

      toast.success(`Started conversation with ${profile.display_name || 'User'}!`);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onStartConversation?.();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all duration-200 transform hover:scale-105">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
              alt={profile.display_name || 'User'}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-sm">
              {profile.display_name || 'Unknown User'}
            </h3>
            {profile.username && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                @{profile.username}
              </Badge>
            )}
            {profile.bio && (
              <p className="text-xs text-slate-400 max-w-[150px] truncate">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              onClick={handleStartConversation}
              disabled={isLoading || user?.id === profile.id}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-xs"
            >
              {isLoading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </>
              )}
            </Button>
          </div>

          {/* NFT-like decoration */}
          <div className="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-80" />
        </div>
      </CardContent>
    </Card>
  );
};
