-- Function to automatically create student points record when a profile is created
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create points record for students
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_points (student_id, total_points, current_streak, longest_streak, level)
    VALUES (NEW.id, 0, 0, 0, 1)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new student profiles
DROP TRIGGER IF EXISTS on_student_profile_created ON public.profiles;
CREATE TRIGGER on_student_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_student();

-- Function to update student points and level
CREATE OR REPLACE FUNCTION public.update_student_points(
  p_student_id UUID,
  p_points_to_add INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Update total points
  UPDATE public.student_points 
  SET 
    total_points = total_points + p_points_to_add,
    last_activity = NOW(),
    updated_at = NOW()
  WHERE student_id = p_student_id
  RETURNING total_points INTO v_new_total;
  
  -- Calculate new level (every 100 points = 1 level)
  v_new_level := FLOOR(v_new_total / 100) + 1;
  
  -- Update level if changed
  UPDATE public.student_points 
  SET level = v_new_level
  WHERE student_id = p_student_id AND level != v_new_level;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_student_streak(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT 
    DATE(last_activity),
    current_streak,
    longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.student_points 
  WHERE student_id = p_student_id;
  
  -- Check if activity is consecutive
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Same day, no change to streak
    RETURN;
  ELSE
    -- Reset streak
    v_current_streak := 1;
  END IF;
  
  -- Update longest streak if current is longer
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update the record
  UPDATE public.student_points 
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity = NOW(),
    updated_at = NOW()
  WHERE student_id = p_student_id;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_achievement RECORD;
  v_progress_count INTEGER;
  v_streak INTEGER;
  v_subject_progress INTEGER;
BEGIN
  -- Get student's current stats
  SELECT current_streak INTO v_streak
  FROM public.student_points 
  WHERE student_id = p_student_id;
  
  -- Check each achievement
  FOR v_achievement IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id 
      FROM public.student_achievements 
      WHERE student_id = p_student_id
    )
  LOOP
    -- Check completion-based achievements
    IF v_achievement.badge_type = 'completion' THEN
      SELECT COUNT(*) INTO v_progress_count
      FROM public.student_progress sp
      WHERE sp.student_id = p_student_id 
      AND sp.status = 'completed';
      
      -- Check if criteria met
      IF (v_achievement.criteria->>'lessons_completed')::INTEGER <= v_progress_count THEN
        INSERT INTO public.student_achievements (student_id, achievement_id)
        VALUES (p_student_id, v_achievement.id);
        
        -- Award points
        PERFORM public.update_student_points(p_student_id, v_achievement.points_reward);
      END IF;
    END IF;
    
    -- Check streak-based achievements
    IF v_achievement.badge_type = 'streak' THEN
      IF (v_achievement.criteria->>'min_streak')::INTEGER <= v_streak THEN
        INSERT INTO public.student_achievements (student_id, achievement_id)
        VALUES (p_student_id, v_achievement.id);
        
        -- Award points
        PERFORM public.update_student_points(p_student_id, v_achievement.points_reward);
      END IF;
    END IF;
  END LOOP;
END;
$$;
