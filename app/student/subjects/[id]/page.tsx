import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SubjectView } from "@/components/student/subject-view"

interface SubjectPageProps {
  params: Promise<{ id: string }>
}

export default async function SubjectPage({ params }: SubjectPageProps) {
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

  // Get subject details
  const { data: subject } = await supabase.from("subjects").select("*").eq("id", id).single()

  if (!subject) {
    redirect("/student/dashboard")
  }

  // Get courses for this subject and grade level
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      lessons (
        id,
        title,
        description,
        lesson_type,
        order_index,
        points_reward
      )
    `)
    .eq("subject_id", id)
    .eq("grade_level", profile.grade_level)
    .eq("is_active", true)
    .order("title")

  // Get student progress for these courses
  const courseIds = courses?.flatMap((course) => course.lessons?.map((lesson) => lesson.id) || []) || []

  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", user.id)
    .in("lesson_id", courseIds)

  return <SubjectView subject={subject} courses={courses || []} progress={progress || []} profile={profile} />
}
