import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    let query = supabase
      .from("student_progress")
      .select(`
        *,
        lessons (
          id,
          title,
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
      .eq("student_id", studentId)

    if (lessonId) {
      query = query.eq("lesson_id", lessonId)
    }

    if (courseId) {
      query = query.eq("lessons.course_id", courseId)
    }

    const { data, error } = await query.order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { student_id, lesson_id, status, score, time_spent } = body

    if (!student_id || !lesson_id) {
      return NextResponse.json({ error: "Student ID and Lesson ID are required" }, { status: 400 })
    }

    // Upsert progress record
    const { data, error } = await supabase
      .from("student_progress")
      .upsert({
        student_id,
        lesson_id,
        status: status || "in_progress",
        score: score || 0,
        time_spent: time_spent || 0,
        attempts: 1,
        updated_at: new Date().toISOString(),
        ...(status === "completed" && { completed_at: new Date().toISOString() }),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
