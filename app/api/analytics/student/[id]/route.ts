import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const studentId = params.id

    // Get comprehensive student analytics
    const [progressData, pointsData, streakData, achievementsData] = await Promise.all([
      // Progress by subject
      supabase
        .from("student_progress")
        .select(`
          *,
          lessons (
            id,
            title,
            points_reward,
            courses (
              id,
              title,
              subjects (
                id,
                name
              )
            )
          )
        `)
        .eq("student_id", studentId),

      // Student points and level
      supabase
        .from("student_points")
        .select("*")
        .eq("student_id", studentId)
        .single(),

      // Current streak
      supabase
        .from("student_streaks")
        .select("*")
        .eq("student_id", studentId)
        .single(),

      // Achievements
      supabase
        .from("student_achievements")
        .select(`
          *,
          achievements (
            id,
            name,
            description,
            icon,
            points_reward
          )
        `)
        .eq("student_id", studentId),
    ])

    // Calculate analytics
    const analytics = {
      totalLessons: progressData.data?.length || 0,
      completedLessons: progressData.data?.filter((p) => p.status === "completed").length || 0,
      averageScore: 0,
      totalTimeSpent: 0,
      subjectProgress: {},
      recentActivity: [],
      points: pointsData.data?.total_points || 0,
      level: pointsData.data?.level || 1,
      currentStreak: streakData.data?.current_streak || 0,
      achievements: achievementsData.data || [],
    }

    if (progressData.data && progressData.data.length > 0) {
      const completedProgress = progressData.data.filter((p) => p.status === "completed" && p.score > 0)
      analytics.averageScore = completedProgress.length
        ? Math.round(completedProgress.reduce((sum, p) => sum + p.score, 0) / completedProgress.length)
        : 0

      analytics.totalTimeSpent = progressData.data.reduce((sum, p) => sum + (p.time_spent || 0), 0)

      // Group by subject
      const subjectGroups: Record<string, any> = {}
      progressData.data.forEach((progress) => {
        const subject = progress.lessons.courses.subjects
        if (!subjectGroups[subject.id]) {
          subjectGroups[subject.id] = {
            name: subject.name,
            total: 0,
            completed: 0,
            averageScore: 0,
            totalScore: 0,
          }
        }
        subjectGroups[subject.id].total++
        if (progress.status === "completed") {
          subjectGroups[subject.id].completed++
          subjectGroups[subject.id].totalScore += progress.score || 0
        }
      })

      // Calculate averages
      Object.keys(subjectGroups).forEach((subjectId) => {
        const subject = subjectGroups[subjectId]
        subject.averageScore = subject.completed > 0 ? Math.round(subject.totalScore / subject.completed) : 0
        subject.completionRate = Math.round((subject.completed / subject.total) * 100)
      })

      analytics.subjectProgress = subjectGroups

      // Recent activity (last 10 completed lessons)
      analytics.recentActivity = progressData.data
        .filter((p) => p.status === "completed" && p.completed_at)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        .slice(0, 10)
        .map((p) => ({
          lessonTitle: p.lessons.title,
          courseTitle: p.lessons.courses.title,
          subjectName: p.lessons.courses.subjects.name,
          score: p.score,
          completedAt: p.completed_at,
          pointsEarned: Math.floor((p.score * p.lessons.points_reward) / 100),
        }))
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
