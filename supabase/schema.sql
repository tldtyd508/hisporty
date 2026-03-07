-- supabase/schema.sql
-- WBC 2026 Hisporty 전체 스키마 + 시드 데이터

-- 1. Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  stadium TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '예정', -- '예정', '진행중', '종료'
  time_kst TEXT -- 한국 시간 기준 경기 시작 시각 (예: '19:00')
);

-- 2. Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_nickname TEXT NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL,
  comment TEXT,
  location TEXT NOT NULL, -- '직관', '집관', '펍/식당'
  companion TEXT,
  supporting_team TEXT, -- 응원팀 (예: '대한민국', '일본')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create review_likes table
CREATE TABLE public.review_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(review_id, user_id) -- 1인 1좋아요
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- Games: Everyone can read
CREATE POLICY "Public games are viewable by everyone."
  ON public.games FOR SELECT USING ( true );

-- Reviews: Everyone can read
CREATE POLICY "Public reviews are viewable by everyone."
  ON public.reviews FOR SELECT USING ( true );

-- Reviews: Authenticated users can insert
CREATE POLICY "Users can create a review."
  ON public.reviews FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Reviews: Users can update their own review
CREATE POLICY "Users can update their own review."
  ON public.reviews FOR UPDATE USING ( auth.uid() = user_id );

-- Reviews: Users can delete their own review
CREATE POLICY "Users can delete their own review."
  ON public.reviews FOR DELETE USING ( auth.uid() = user_id );

-- Review Likes: Everyone can read
CREATE POLICY "Anyone can view likes."
  ON public.review_likes FOR SELECT USING ( true );

-- Review Likes: Authenticated users can like
CREATE POLICY "Authenticated users can like."
  ON public.review_likes FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Review Likes: Users can unlike
CREATE POLICY "Users can unlike."
  ON public.review_likes FOR DELETE USING ( auth.uid() = user_id );

-- 5. Initial Data: 2026 WBC 조별리그 전체 40경기

-- Pool C — 도쿄돔 (10경기)
INSERT INTO public.games (date, home_team, away_team, stadium, time_kst, status) VALUES
  ('2026-03-05', '대만', '호주', '도쿄돔', '12:00', '예정'),
  ('2026-03-05', '체코', '대한민국', '도쿄돔', '19:00', '예정'),
  ('2026-03-06', '호주', '체코', '도쿄돔', '12:00', '예정'),
  ('2026-03-06', '일본', '대만', '도쿄돔', '19:00', '예정'),
  ('2026-03-07', '대만', '체코', '도쿄돔', '12:00', '예정'),
  ('2026-03-07', '대한민국', '일본', '도쿄돔', '19:00', '예정'),
  ('2026-03-08', '대만', '대한민국', '도쿄돔', '12:00', '예정'),
  ('2026-03-08', '호주', '일본', '도쿄돔', '19:00', '예정'),
  ('2026-03-09', '대한민국', '호주', '도쿄돔', '19:00', '예정'),
  ('2026-03-10', '체코', '일본', '도쿄돔', '19:00', '예정');

-- Pool A — 산후안 Hiram Bithorn Stadium (10경기)
INSERT INTO public.games (date, home_team, away_team, stadium, time_kst, status) VALUES
  ('2026-03-06', '쿠바', '파나마', 'Hiram Bithorn Stadium', '01:00', '예정'),
  ('2026-03-06', '푸에르토리코', '콜롬비아', 'Hiram Bithorn Stadium', '08:00', '예정'),
  ('2026-03-07', '콜롬비아', '캐나다', 'Hiram Bithorn Stadium', '01:00', '예정'),
  ('2026-03-07', '파나마', '푸에르토리코', 'Hiram Bithorn Stadium', '08:00', '예정'),
  ('2026-03-08', '콜롬비아', '쿠바', 'Hiram Bithorn Stadium', '01:00', '예정'),
  ('2026-03-08', '파나마', '캐나다', 'Hiram Bithorn Stadium', '08:00', '예정'),
  ('2026-03-09', '콜롬비아', '파나마', 'Hiram Bithorn Stadium', '01:00', '예정'),
  ('2026-03-09', '쿠바', '푸에르토리코', 'Hiram Bithorn Stadium', '08:00', '예정'),
  ('2026-03-10', '캐나다', '푸에르토리코', 'Hiram Bithorn Stadium', '08:00', '예정'),
  ('2026-03-11', '캐나다', '쿠바', 'Hiram Bithorn Stadium', '04:00', '예정');

-- Pool B — 휴스턴 Daikin Park (10경기)
INSERT INTO public.games (date, home_team, away_team, stadium, time_kst, status) VALUES
  ('2026-03-06', '멕시코', '영국', 'Daikin Park', '03:00', '예정'),
  ('2026-03-06', '미국', '브라질', 'Daikin Park', '10:00', '예정'),
  ('2026-03-07', '브라질', '이탈리아', 'Daikin Park', '03:00', '예정'),
  ('2026-03-07', '영국', '미국', 'Daikin Park', '10:00', '예정'),
  ('2026-03-08', '영국', '이탈리아', 'Daikin Park', '03:00', '예정'),
  ('2026-03-08', '브라질', '멕시코', 'Daikin Park', '10:00', '예정'),
  ('2026-03-09', '브라질', '영국', 'Daikin Park', '03:00', '예정'),
  ('2026-03-09', '멕시코', '미국', 'Daikin Park', '10:00', '예정'),
  ('2026-03-10', '이탈리아', '미국', 'Daikin Park', '11:00', '예정'),
  ('2026-03-11', '이탈리아', '멕시코', 'Daikin Park', '09:00', '예정');

-- Pool D — 마이애미 loanDepot Park (10경기)
INSERT INTO public.games (date, home_team, away_team, stadium, time_kst, status) VALUES
  ('2026-03-06', '네덜란드', '베네수엘라', 'loanDepot Park', '02:00', '예정'),
  ('2026-03-06', '니카라과', '도미니카 공화국', 'loanDepot Park', '09:00', '예정'),
  ('2026-03-07', '니카라과', '네덜란드', 'loanDepot Park', '02:00', '예정'),
  ('2026-03-07', '이스라엘', '베네수엘라', 'loanDepot Park', '09:00', '예정'),
  ('2026-03-08', '네덜란드', '도미니카 공화국', 'loanDepot Park', '02:00', '예정'),
  ('2026-03-08', '니카라과', '이스라엘', 'loanDepot Park', '09:00', '예정'),
  ('2026-03-09', '도미니카 공화국', '이스라엘', 'loanDepot Park', '02:00', '예정'),
  ('2026-03-09', '베네수엘라', '니카라과', 'loanDepot Park', '09:00', '예정'),
  ('2026-03-10', '이스라엘', '네덜란드', 'loanDepot Park', '09:00', '예정'),
  ('2026-03-11', '도미니카 공화국', '베네수엘라', 'loanDepot Park', '10:00', '예정');
