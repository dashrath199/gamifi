"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Target } from "lucide-react"

interface ClassAnalyticsProps {
  classStats: any[]
  students: any[]
}

export function ClassAnalytics({ classStats, students }: ClassAnalyticsProps) {
  // Calculate analytics
  const totalAttempts = classStats.length
  const completedLessons = classStats.filter((s) => s.status === "completed").length
  const completionRate = totalAttempts > 0 ? Math.round((completedLessons / totalAttempts) * 100) : 0

  const scores = classStats.map((s) => s.score || 0)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // Score distribution
  const scoreRanges = {
    "A (90-100%)": scores.filter((s) => s >= 90).length,
    "B (80-89%)": scores.filter((s) => s >= 80 && s < 90).length,
    "C (70-79%)": scores.filter((s) => s >= 70 && s < 80).length,
    "D (60-69%)": scores.filter((s) => s >= 60 && s < 70).length,
    "F (0-59%)": scores.filter((s) => s < 60).length,
  }

  // Grade level distribution
  const gradeLevels = students.reduce(
    (acc, student) => {
      const grade = `Grade ${student.grade_level}`
      acc[grade] = (acc[grade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Engagement metrics
  const activeStudents = students.filter(
    (s) =>
      s.student_points?.[0]?.last_activity &&
      new Date(s.student_points[0].last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  const engagementRate = students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{averageScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-purple-600">{engagementRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-orange-600">{totalAttempts}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>How students are performing across different grade ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(scoreRanges).map(([range, count]) => {
                const percentage = totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0
                return (
                  <div key={range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{range}</span>
                      <span>
                        {count} students ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Grade Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Level Distribution</CardTitle>
            <CardDescription>Number of students in each grade level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(gradeLevels).map(([grade, count]) => {
                const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0
                return (
                  <div key={grade} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{grade}</span>
                      <span>
                        {count} students ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
              {Object.keys(gradeLevels).length === 0 && (
                <p className="text-gray-600 text-center py-4">No grade level data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Class Insights</CardTitle>
          <CardDescription>AI-powered insights about your class performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {averageScore >= 80 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎉 Excellent Performance!</h4>
                <p className="text-green-700 text-sm">
                  Your class is performing exceptionally well with an average score of {averageScore}%. Keep up the
                  great work!
                </p>
              </div>
            )}

            {averageScore < 60 && totalAttempts > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">📚 Focus Area Identified</h4>
                <p className="text-red-700 text-sm">
                  The class average of {averageScore}% suggests students may need additional support. Consider reviewing
                  fundamental concepts or providing extra practice materials.
                </p>
              </div>
            )}

            {engagementRate < 50 && students.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚡ Boost Engagement</h4>
                <p className="text-yellow-700 text-sm">
                  Only {engagementRate}% of students were active this week. Try introducing new gamification elements or
                  interactive challenges to increase participation.
                </p>
              </div>
            )}

            {completionRate > 90 && totalAttempts > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🚀 High Completion Rate</h4>
                <p className="text-blue-700 text-sm">
                  Fantastic! {completionRate}% completion rate shows students are highly engaged with the content.
                </p>
              </div>
            )}

            {totalAttempts === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📊 No Data Yet</h4>
                <p className="text-gray-700 text-sm">
                  Once students start completing lessons, you'll see detailed analytics and insights here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
