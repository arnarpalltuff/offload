-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('results', 'streak', 'group', 'premium', 'system')),
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix: predictions UPDATE policy (needed for upsert)
CREATE POLICY "Users can update own predictions" ON predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix: allow viewing groups by invite_code for join flow
CREATE POLICY "Groups viewable by invite code lookup" ON groups
  FOR SELECT USING (true);
-- (This replaces the members-only policy above to allow join page to find the group.
--  The actual sensitive data is in group_members, not in the groups table itself.)

-- Fix: group creator can delete members
CREATE POLICY "Group creator can remove members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
    OR auth.uid() = user_id
  );

-- Function to create notification (called from triggers or cron)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_type TEXT DEFAULT 'system'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, title, body, type)
  VALUES (p_user_id, p_title, p_body, p_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
