
import { useState } from "react";
import { User, MessageSquare, Clock, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export const ProfileMenu = () => {
  const { user } = useAuth();
  const [copiedUID, setCopiedUID] = useState(false);

  // Fetch user profile and statistics
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total conversations
      const { data: conversationsData, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (convError) {
        console.error('Error fetching conversations count:', convError);
      }

      // Get total messages sent
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', user.id);

      if (msgError) {
        console.error('Error fetching messages count:', msgError);
      }

      return {
        totalConversations: conversationsData?.length || 0,
        totalMessages: messagesData?.length || 0,
        joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
      };
    },
    enabled: !!user,
  });

  const copyUID = async () => {
    if (!user) return;
    
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedUID(true);
      toast.success("UID copied to clipboard!");
      setTimeout(() => setCopiedUID(false), 2000);
    } catch (error) {
      toast.error("Failed to copy UID");
    }
  };

  if (!user || !profile) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 rounded-lg p-2 transition-colors">
          <div className="relative">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
              alt={profile.display_name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">
              {profile.display_name || 'Loading...'}
            </h3>
            <p className="text-xs text-slate-400 truncate">Online</p>
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 bg-slate-800 border-slate-700 text-white">
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
              alt={profile.display_name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-white">
                {profile.display_name || 'Unknown User'}
              </h3>
              <p className="text-sm text-slate-400">
                {profile.username ? `@${profile.username}` : 'No username set'}
              </p>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-sm text-slate-300">{profile.bio}</p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Messages</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {stats?.totalMessages || 0}
              </p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Conversations</span>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {stats?.totalConversations || 0}
              </p>
            </div>
          </div>

          {/* Join Date */}
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Joined</span>
            </div>
            <p className="text-sm text-white mt-1">
              {stats?.joinedDate || 'Unknown'}
            </p>
          </div>

          {/* UID Section */}
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">User ID</span>
                <p className="text-xs font-mono text-slate-300 mt-1 break-all">
                  {user.id}
                </p>
              </div>
              <button
                onClick={copyUID}
                className="p-2 hover:bg-slate-600 rounded-md transition-colors"
                title="Copy UID"
              >
                {copiedUID ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
