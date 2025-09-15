"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentProgressChartProps {
  students: any[]
  recentProgress: any[]
}

export function StudentProgressChart({ students, recentProgress }: StudentProgressChartProps) {
  // This would typically use a charting library like Recharts
  // For now, we'll create a simple visual representation

  const chartData = students.map((student) => {
    const studentProgress = recentProgress.filter((p) => p.profiles?.full_name === student.full_name)
    const avgScore =
      studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / studentProgress.length)
        : 0

    return {
      name: student.full_name,
      score: avgScore,
      lessons: studentProgress.length,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress Overview</CardTitle>
        <CardDescription>Average scores and lesson completion by student</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((data, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-800">
                  {data.name.charAt(0)}
                </div>
                <span className="font-medium">{data.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Avg Score</div>
                  <div className="font-bold text-blue-600">{data.score}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Lessons</div>
                  <div className="font-bold text-green-600">{data.lessons}</div>
                </div>
              </div>
            </div>
          ))}
          {chartData.length === 0 && (
            <p className="text-gray-600 text-center py-4">No student progress data available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
