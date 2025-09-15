import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TeacherDashboard } from "@/components/teacher/dashboard"

export default async function TeacherDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/")
  }

  // Get students from the same school
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      *,
      student_points (*),
      student_achievements (
        *,
        achievements (*)
      )
    `)
    .eq("role", "student")
    .eq("school_name", profile.school_name || "")
    .order("full_name")

  // Get subjects and courses
  const { data: subjects } = await supabase.from("subjects").select("*").order("name")

  // Get recent student progress
  const studentIds = students?.map((s) => s.id) || []
  const { data: recentProgress } = await supabase
    .from("student_progress")
    .select(`
      *,
      profiles!student_id (full_name, grade_level),
      lessons (
        title,
        courses (
          title,
          subjects (name, icon)
        )
      )
    `)
    .in("student_id", studentIds)
    .order("updated_at", { ascending: false })
    .limit(20)

  // Get class analytics
  const { data: classStats } = await supabase
    .from("student_progress")
    .select("status, score, lesson_id")
    .in("student_id", studentIds)

  return (
    <TeacherDashboard
      profile={profile}
      students={students || []}
      subjects={subjects || []}
      recentProgress={recentProgress || []}
      classStats={classStats || []}
    />
  )
}
