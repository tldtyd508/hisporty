-- supabase/schema.sql

-- 1. Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  stadium TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '예정' -- '예정', '진행중', '종료'
);

-- 2. Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_nickname TEXT NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL,
  comment TEXT,
  location TEXT NOT NULL, -- '직관(홈석)', '직관(원정석)', '집관', '펍/식당'
  companion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Games: Everyone can read
CREATE POLICY "Public games are viewable by everyone."
  ON public.games FOR SELECT
  USING ( true );

-- Reviews: Everyone can read
CREATE POLICY "Public reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING ( true );

-- Reviews: Authenticated users (including anonymous) can insert
CREATE POLICY "Users can create a review."
  ON public.reviews FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Reviews: Users can update their own review
CREATE POLICY "Users can update their own review."
  ON public.reviews FOR UPDATE
  USING ( auth.uid() = user_id );

-- Reviews: Users can delete their own review
CREATE POLICY "Users can delete their own review."
  ON public.reviews FOR DELETE
  USING ( auth.uid() = user_id );

-- 4. Initial Data: 2026 WBC Korea Matches
INSERT INTO public.games (id, date, home_team, away_team, stadium, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '2026-03-05', '대한민국', '호주', '도쿄돔', '예정'),
  ('22222222-2222-2222-2222-222222222222', '2026-03-06', '대한민국', '일본', '도쿄돔', '예정'),
  ('33333333-3333-3333-3333-333333333333', '2026-03-08', '대한민국', '체코', '도쿄돔', '예정'),
  ('44444444-4444-4444-4444-444444444444', '2026-03-09', '대한민국', '예선통과팀', '도쿄돔', '예정');
