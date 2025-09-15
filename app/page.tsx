import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WelcomeScreen } from "@/components/welcome-screen"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <WelcomeScreen />
  }

  // Get user profile to determine redirect
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role === "teacher") {
    redirect("/teacher/dashboard")
  } else {
    redirect("/student/dashboard")
  }
}
