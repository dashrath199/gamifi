import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LessonPlayer } from "@/components/student/lesson-player"

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/")
  }

  // Get lesson details with course and subject info
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      *,
      courses (
        *,
        subjects (*)
      )
    `)
    .eq("id", id)
    .single()

  if (!lesson) {
    redirect("/student/dashboard")
  }

  // Get student's progress for this lesson
  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .eq("lesson_id", id)
    .single()

  // Get student points for level calculation
  const { data: studentPoints } = await supabase.from("student_points").select("*").eq("student_id", user.id).single()

  return <LessonPlayer lesson={lesson} progress={progress} profile={profile} studentPoints={studentPoints} />
}
