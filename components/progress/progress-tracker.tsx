"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Play, RotateCcw } from "lucide-react"

interface ProgressTrackerProps {
  studentId: string
  courseId?: string
  lessonId?: string
  onProgressUpdate?: (progress: any) => void
}

export function ProgressTracker({ studentId, courseId, lessonId, onProgressUpdate }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [studentId, courseId, lessonId])

  const fetchProgress = async () => {
    try {
      const params = new URLSearchParams({ studentId })
      if (courseId) params.append("courseId", courseId)
      if (lessonId) params.append("lessonId", lessonId)

      const response = await fetch(`/api/progress?${params}`)
      const data = await response.json()
      setProgress(data.data || [])
    } catch (error) {
      console.error("Failed to fetch progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (lessonId: string, status: string, score?: number, timeSpent?: number) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          lesson_id: lessonId,
          status,
          score,
          time_spent: timeSpent,
        }),
      })

      const data = await response.json()
      if (data.data) {
        await fetchProgress() // Refresh progress
        onProgressUpdate?.(data.data[0])
      }
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "mastered":
        return "default"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "mastered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (progress.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No progress data available. Start learning to track your progress!</p>
        </CardContent>
      </Card>
    )
  }

  const completedCount = progress.filter((p) => p.status === "completed").length
  const totalCount = progress.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const averageScore = progress.filter((p) => p.score > 0).reduce((sum, p, _, arr) => sum + p.score / arr.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your learning journey and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(averageScore)}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(item.status)}
                    <h4 className="font-medium">{item.lessons.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.lessons.courses.title} • {item.lessons.courses.subjects.name}
                  </p>
                  {item.completed_at && (
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {item.score > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-bold">{item.score}%</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  )}

                  {item.attempts > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-bold">{item.attempts}</div>
                      <div className="text-xs text-gray-500">Attempts</div>
                    </div>
                  )}

                  <Badge variant={getStatusColor(item.status)} className="flex items-center gap-1">
                    {item.status.replace("_", " ")}
                  </Badge>

                  {item.status === "completed" && item.score < 80 && (
                    <Button size="sm" variant="outline" onClick={() => updateProgress(item.lesson_id, "in_progress")}>
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
