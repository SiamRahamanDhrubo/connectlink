
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to conversations they participate in" ON public.messages;

-- Create a security definer function to check if user participates in a conversation
CREATE OR REPLACE FUNCTION public.user_participates_in_conversation(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_participants.conversation_id = $1 
    AND conversation_participants.user_id = $2
  );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view conversations they participate in" ON public.conversations 
  FOR SELECT USING (
    public.user_participates_in_conversation(id, auth.uid())
  );

CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants 
  FOR SELECT USING (
    public.user_participates_in_conversation(conversation_id, auth.uid())
  );

CREATE POLICY "Users can view messages in their conversations" ON public.messages 
  FOR SELECT USING (
    public.user_participates_in_conversation(conversation_id, auth.uid())
  );

CREATE POLICY "Users can send messages to conversations they participate in" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    public.user_participates_in_conversation(conversation_id, auth.uid())
  );
