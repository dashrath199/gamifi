"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Play, CheckCircle, Clock, Star } from "lucide-react"

interface SubjectViewProps {
  subject: any
  courses: any[]
  progress: any[]
  profile: any
}

export function SubjectView({ subject, courses, progress, profile }: SubjectViewProps) {
  const getProgressForLesson = (lessonId: string) => {
    return progress.find((p) => p.lesson_id === lessonId)
  }

  const getCourseProgress = (course: any) => {
    if (!course.lessons) return { completed: 0, total: 0, percentage: 0 }

    const completed = course.lessons.filter((lesson: any) => {
      const lessonProgress = getProgressForLesson(lesson.id)
      return lessonProgress?.status === "completed"
    }).length

    const total = course.lessons.length
    const percentage = total > 0 ? (completed / total) * 100 : 0

    return { completed, total, percentage }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/student/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-6xl">{subject.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
              <p className="text-gray-600 text-lg">{subject.description}</p>
              <Badge variant="secondary" className="mt-2">
                Grade {profile.grade_level}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
              <p className="text-gray-600">
                Courses for {subject.name} at Grade {profile.grade_level} are coming soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const courseProgress = getCourseProgress(course)

              return (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="text-blue-100">{course.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{Math.round(courseProgress.percentage)}%</div>
                        <div className="text-sm text-blue-100">Complete</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Progress value={courseProgress.percentage} className="h-2 bg-blue-400" />
                      <div className="flex justify-between text-sm text-blue-100 mt-1">
                        <span>
                          {courseProgress.completed} of {courseProgress.total} lessons
                        </span>
                        <span>{course.estimated_duration} min total</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {!course.lessons || course.lessons.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">No lessons available for this course yet.</p>
                    ) : (
                      <div className="grid gap-4">
                        {course.lessons
                          .sort((a: any, b: any) => a.order_index - b.order_index)
                          .map((lesson: any) => {
                            const lessonProgress = getProgressForLesson(lesson.id)
                            const isCompleted = lessonProgress?.status === "completed"
                            const isInProgress = lessonProgress?.status === "in_progress"

                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : isInProgress ? (
                                      <Clock className="h-6 w-6 text-yellow-500" />
                                    ) : (
                                      <Play className="h-6 w-6 text-gray-400" />
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <h4 className="font-medium">{lesson.title}</h4>
                                    <p className="text-sm text-gray-600">{lesson.description}</p>

                                    <div className="flex items-center gap-4 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {lesson.lesson_type}
                                      </Badge>
                                      <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <Star className="h-3 w-3" />
                                        {lesson.points_reward} points
                                      </div>
                                      {lessonProgress && (
                                        <div className="text-xs text-gray-600">Best Score: {lessonProgress.score}%</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <Link href={`/student/lessons/${lesson.id}`}>
                                  <Button variant={isCompleted ? "outline" : "default"} size="sm">
                                    {isCompleted ? "Review" : isInProgress ? "Continue" : "Start"}
                                  </Button>
                                </Link>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
