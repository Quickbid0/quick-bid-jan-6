ALTER TABLE "public"."bids" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view bids (public auction history)
CREATE POLICY "Anyone can view bids"
ON "public"."bids"
FOR SELECT
USING (true);

-- Allow authenticated users to place their own bids
CREATE POLICY "Users can place their own bids"
ON "public"."bids"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all bids
CREATE POLICY "Admins can manage bids"
ON "public"."bids"
USING (public.is_admin());
