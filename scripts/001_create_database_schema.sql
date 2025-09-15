-- Create users table extending Supabase auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  grade_level INTEGER CHECK (grade_level >= 6 AND grade_level <= 12),
  preferred_language TEXT DEFAULT 'en',
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 6 AND grade_level <= 12),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Store lesson content, questions, etc.
  lesson_type TEXT CHECK (lesson_type IN ('video', 'interactive', 'quiz', 'game', 'simulation')) DEFAULT 'interactive',
  order_index INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')) DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Create achievements/badges table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge_type TEXT CHECK (badge_type IN ('completion', 'streak', 'score', 'time', 'special')) DEFAULT 'completion',
  criteria JSONB, -- Store achievement criteria
  points_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Create student points table for gamification
CREATE TABLE IF NOT EXISTS public.student_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Create multilingual content table
CREATE TABLE IF NOT EXISTS public.content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'lesson', 'achievement', 'subject')),
  content_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  field_name TEXT NOT NULL, -- title, description, etc.
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, language_code, field_name)
);

-- Create offline sync table for tracking changes
CREATE TABLE IF NOT EXISTS public.offline_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('insert', 'update', 'delete')) NOT NULL,
  data JSONB,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for subjects (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);

-- Create RLS policies for courses (public read)
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);

-- Create RLS policies for lessons (public read)
CREATE POLICY "Anyone can view active lessons" ON public.lessons FOR SELECT USING (is_active = true);

-- Create RLS policies for student progress
CREATE POLICY "Students can view their own progress" ON public.student_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own progress" ON public.student_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own progress" ON public.student_progress FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view all student progress" ON public.student_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Create RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (is_active = true);

-- Create RLS policies for student achievements
CREATE POLICY "Students can view their own achievements" ON public.student_achievements FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own achievements" ON public.student_achievements FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create RLS policies for student points
CREATE POLICY "Students can view their own points" ON public.student_points FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can update their own points" ON public.student_points FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own points" ON public.student_points FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create RLS policies for content translations (public read)
CREATE POLICY "Anyone can view translations" ON public.content_translations FOR SELECT USING (true);

-- Create RLS policies for offline sync
CREATE POLICY "Users can manage their own sync data" ON public.offline_sync FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_grade_level ON public.profiles(grade_level);
CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON public.courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_grade_level ON public.courses(grade_level);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON public.lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson_id ON public.student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_lookup ON public.content_translations(content_type, content_id, language_code);
CREATE INDEX IF NOT EXISTS idx_offline_sync_user_synced ON public.offline_sync(user_id, synced);
