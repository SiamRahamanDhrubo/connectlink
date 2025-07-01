
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat, Message } from "@/pages/Index";

export const useChatMessages = (chat: Chat) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user || !chat.conversation_id) return;

    console.log('Setting up real-time subscription for conversation:', chat.conversation_id);

    const channel = supabase
      .channel(`messages-${chat.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chat.conversation_id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', chat.conversation_id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, chat.conversation_id, queryClient]);

  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chat.conversation_id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching messages for conversation:', chat.conversation_id);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('conversation_id', chat.conversation_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Get profiles for all unique sender IDs
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      if (senderIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', senderIds);

      // Create a map of sender_id to profile
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Transform data to match Message interface
      const transformedMessages: Message[] = data.map((msg) => {
        const profile = profileMap.get(msg.sender_id);
        return {
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.sender_id === user.id,
          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          sender_id: msg.sender_id
        };
      });

      console.log('Fetched messages:', transformedMessages.length);
      return transformedMessages;
    },
    enabled: !!user && !!chat.conversation_id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, fileData }: { content: string; fileData?: { name: string; type: string; data: string } }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Sending message to conversation:', chat.conversation_id);
      
      let messageContent = content;
      if (fileData) {
        messageContent = `${content}\n[File: ${fileData.name}]`;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chat.conversation_id,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chat.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });

  const sendMessage = async (content: string, fileData?: { name: string; type: string; data: string }) => {
    sendMessageMutation.mutate({ content, fileData });
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isError: sendMessageMutation.isError,
    isPending: sendMessageMutation.isPending
  };
};
