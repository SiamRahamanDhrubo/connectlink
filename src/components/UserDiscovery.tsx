
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserTagCard } from "./UserTagCard";
import { Input } from "@/components/ui/input";

interface UserDiscoveryProps {
  onUserSelected?: () => void;
}

export const UserDiscovery = ({ onUserSelected }: UserDiscoveryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio, username')
        .neq('id', user.id); // Exclude current user

      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Discover Users</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search users by name, username, or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-8 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No users found</p>
          {searchQuery && (
            <p className="text-sm mt-1">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((profile) => (
            <UserTagCard
              key={profile.id}
              profile={profile}
              onStartConversation={onUserSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};
