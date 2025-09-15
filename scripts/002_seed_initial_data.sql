-- Insert default subjects
INSERT INTO public.subjects (name, description, icon, color) VALUES
('Mathematics', 'Numbers, algebra, geometry, and problem-solving', '🔢', '#3B82F6'),
('Science', 'Physics, chemistry, biology, and scientific method', '🔬', '#10B981'),
('Technology', 'Computer science, programming, and digital literacy', '💻', '#8B5CF6'),
('Engineering', 'Design thinking, problem-solving, and innovation', '⚙️', '#F59E0B')
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, badge_type, criteria, points_reward) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'completion', '{"lessons_completed": 1}', 25),
('Quick Learner', 'Complete a lesson in under 5 minutes', '⚡', 'time', '{"max_time": 300}', 50),
('Perfect Score', 'Get 100% on any lesson', '⭐', 'score', '{"min_score": 100}', 75),
('Streak Master', 'Complete lessons for 7 days in a row', '🔥', 'streak', '{"min_streak": 7}', 100),
('Math Wizard', 'Complete 10 math lessons', '🧙‍♂️', 'completion', '{"subject": "Mathematics", "lessons_completed": 10}', 150),
('Science Explorer', 'Complete 10 science lessons', '🚀', 'completion', '{"subject": "Science", "lessons_completed": 10}', 150),
('Tech Innovator', 'Complete 10 technology lessons', '💡', 'completion', '{"subject": "Technology", "lessons_completed": 10}', 150),
('Engineering Hero', 'Complete 10 engineering lessons', '🏗️', 'completion', '{"subject": "Engineering", "lessons_completed": 10}', 150)
ON CONFLICT DO NOTHING;

-- Insert sample courses for Grade 6 Mathematics
INSERT INTO public.courses (subject_id, title, description, grade_level, difficulty_level, estimated_duration) 
SELECT 
  s.id,
  'Basic Arithmetic',
  'Learn fundamental arithmetic operations with whole numbers and decimals',
  6,
  'beginner',
  120
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.courses (subject_id, title, description, grade_level, difficulty_level, estimated_duration) 
SELECT 
  s.id,
  'Introduction to Fractions',
  'Understanding fractions, equivalent fractions, and basic operations',
  6,
  'beginner',
  90
FROM public.subjects s WHERE s.name = 'Mathematics';

-- Insert sample courses for Grade 6 Science
INSERT INTO public.courses (subject_id, title, description, grade_level, difficulty_level, estimated_duration) 
SELECT 
  s.id,
  'Living Things and Their Environment',
  'Explore ecosystems, food chains, and biodiversity',
  6,
  'beginner',
  100
FROM public.subjects s WHERE s.name = 'Science';

-- Insert sample lessons for Basic Arithmetic course
INSERT INTO public.lessons (course_id, title, description, content, lesson_type, order_index, points_reward)
SELECT 
  c.id,
  'Addition and Subtraction',
  'Master addition and subtraction with multi-digit numbers',
  '{"type": "interactive", "questions": [{"question": "What is 245 + 167?", "options": ["412", "402", "422", "432"], "correct": 0, "explanation": "245 + 167 = 412"}], "games": [{"type": "number_line", "description": "Use the number line to solve addition problems"}]}',
  'interactive',
  1,
  15
FROM public.courses c WHERE c.title = 'Basic Arithmetic';

INSERT INTO public.lessons (course_id, title, description, content, lesson_type, order_index, points_reward)
SELECT 
  c.id,
  'Multiplication Tables',
  'Learn and practice multiplication tables from 1 to 12',
  '{"type": "game", "questions": [{"question": "What is 7 × 8?", "options": ["54", "56", "58", "64"], "correct": 1, "explanation": "7 × 8 = 56"}], "games": [{"type": "multiplication_race", "description": "Race against time to solve multiplication problems"}]}',
  'game',
  2,
  20
FROM public.courses c WHERE c.title = 'Basic Arithmetic';

-- Insert multilingual content (Hindi translations)
INSERT INTO public.content_translations (content_type, content_id, language_code, field_name, translated_text)
SELECT 
  'subject',
  s.id,
  'hi',
  'name',
  CASE s.name
    WHEN 'Mathematics' THEN 'गणित'
    WHEN 'Science' THEN 'विज्ञान'
    WHEN 'Technology' THEN 'प्रौद्योगिकी'
    WHEN 'Engineering' THEN 'इंजीनियरिंग'
  END
FROM public.subjects s;

INSERT INTO public.content_translations (content_type, content_id, language_code, field_name, translated_text)
SELECT 
  'subject',
  s.id,
  'hi',
  'description',
  CASE s.name
    WHEN 'Mathematics' THEN 'संख्याएं, बीजगणित, ज्यामिति और समस्या समाधान'
    WHEN 'Science' THEN 'भौतिकी, रसायन विज्ञान, जीव विज्ञान और वैज्ञानिक पद्धति'
    WHEN 'Technology' THEN 'कंप्यूटर विज्ञान, प्रोग्रामिंग और डिजिटल साक्षरता'
    WHEN 'Engineering' THEN 'डिज़ाइन सोच, समस्या समाधान और नवाचार'
  END
FROM public.subjects s;

-- Insert Kannada translations
INSERT INTO public.content_translations (content_type, content_id, language_code, field_name, translated_text)
SELECT 
  'subject',
  s.id,
  'kn',
  'name',
  CASE s.name
    WHEN 'Mathematics' THEN 'ಗಣಿತ'
    WHEN 'Science' THEN 'ವಿಜ್ಞಾನ'
    WHEN 'Technology' THEN 'ತಂತ್ರಜ್ಞಾನ'
    WHEN 'Engineering' THEN 'ಇಂಜಿನಿಯರಿಂಗ್'
  END
FROM public.subjects s;

-- Insert Tamil translations
INSERT INTO public.content_translations (content_type, content_id, language_code, field_name, translated_text)
SELECT 
  'subject',
  s.id,
  'ta',
  'name',
  CASE s.name
    WHEN 'Mathematics' THEN 'கணிதம்'
    WHEN 'Science' THEN 'அறிவியல்'
    WHEN 'Technology' THEN 'தொழில்நுட்பம்'
    WHEN 'Engineering' THEN 'பொறியியல்'
  END
FROM public.subjects s;
