import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/dashboard"

export default async function StudentDashboardPage() {
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

  // Get student points and achievements
  const { data: studentPoints } = await supabase.from("student_points").select("*").eq("student_id", user.id).single()

  const { data: achievements } = await supabase
    .from("student_achievements")
    .select(`
      *,
      achievements (*)
    `)
    .eq("student_id", user.id)

  // Get subjects and recent progress
  const { data: subjects } = await supabase.from("subjects").select("*").order("name")

  const { data: recentProgress } = await supabase
    .from("student_progress")
    .select(`
      *,
      lessons (
        *,
        courses (
          *,
          subjects (*)
        )
      )
    `)
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5)

  return (
    <StudentDashboard
      profile={profile}
      studentPoints={studentPoints}
      achievements={achievements || []}
      subjects={subjects || []}
      recentProgress={recentProgress || []}
    />
  )
}
