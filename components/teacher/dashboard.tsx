"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, TrendingUp, Award, Clock, Target, GraduationCap } from "lucide-react"
import { ClassAnalytics } from "./class-analytics"

interface TeacherDashboardProps {
  profile: any
  students: any[]
  subjects: any[]
  recentProgress: any[]
  classStats: any[]
}

export function TeacherDashboard({ profile, students, subjects, recentProgress, classStats }: TeacherDashboardProps) {
  const totalStudents = students.length
  const activeStudents = students.filter(
    (s) =>
      s.student_points?.[0]?.last_activity &&
      new Date(s.student_points[0].last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  const totalLessonsCompleted = classStats.filter((s) => s.status === "completed").length
  const averageScore =
    classStats.length > 0 ? Math.round(classStats.reduce((sum, s) => sum + (s.score || 0), 0) / classStats.length) : 0

  const topPerformers = students
    .filter((s) => s.student_points?.[0])
    .sort((a, b) => (b.student_points[0]?.total_points || 0) - (a.student_points[0]?.total_points || 0))
    .slice(0, 5)

  const strugglingStudents = students
    .filter((s) => {
      const recentActivity = recentProgress.filter((p) => p.profiles?.full_name === s.full_name)
      const avgScore =
        recentActivity.length > 0
          ? recentActivity.reduce((sum, p) => sum + (p.score || 0), 0) / recentActivity.length
          : 0
      return avgScore < 60 && recentActivity.length > 0
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Teacher"}!
                {profile.school_name && ` • ${profile.school_name}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Students</div>
                <div className="text-2xl font-bold text-indigo-600">{totalStudents}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active This Week</p>
                  <p className="text-2xl font-bold">{activeStudents}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Lessons Completed</p>
                  <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-800">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-gray-600">Grade {student.grade_level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {student.student_points?.[0]?.total_points || 0} pts
                          </p>
                          <p className="text-sm text-gray-600">Level {student.student_points?.[0]?.level || 1}</p>
                        </div>
                      </div>
                    ))}
                    {topPerformers.length === 0 && (
                      <p className="text-gray-600 text-center py-4">No student data available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Students Needing Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-red-500" />
                    Students Needing Help
                  </CardTitle>
                  <CardDescription>Students with low recent scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strugglingStudents.map((student) => {
                      const studentProgress = recentProgress.filter((p) => p.profiles?.full_name === student.full_name)
                      const avgScore =
                        studentProgress.length > 0
                          ? Math.round(
                              studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / studentProgress.length,
                            )
                          : 0

                      return (
                        <div key={student.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-gray-600">Grade {student.grade_level}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">{avgScore}% avg</Badge>
                            <p className="text-sm text-gray-600 mt-1">{studentProgress.length} recent attempts</p>
                          </div>
                        </div>
                      )
                    })}
                    {strugglingStudents.length === 0 && (
                      <p className="text-gray-600 text-center py-4">All students are performing well!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recent Student Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProgress.slice(0, 10).map((progress) => (
                    <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{progress.lessons?.courses?.subjects?.icon}</div>
                        <div>
                          <p className="font-medium">{progress.profiles?.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {progress.lessons?.title} • {progress.lessons?.courses?.subjects?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                          {progress.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">Score: {progress.score}%</p>
                      </div>
                    </div>
                  ))}
                  {recentProgress.length === 0 && (
                    <p className="text-gray-600 text-center py-4">No recent activity to display.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>Complete list of students in your class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => {
                    const studentProgress = recentProgress.filter((p) => p.profiles?.full_name === student.full_name)
                    const completedLessons = studentProgress.filter((p) => p.status === "completed").length
                    const avgScore =
                      studentProgress.length > 0
                        ? Math.round(
                            studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / studentProgress.length,
                          )
                        : 0

                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="font-bold text-blue-800">{student.full_name?.charAt(0) || "S"}</span>
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-gray-600">
                              Grade {student.grade_level} • {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Points</p>
                            <p className="font-bold text-blue-600">{student.student_points?.[0]?.total_points || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Level</p>
                            <p className="font-bold text-green-600">{student.student_points?.[0]?.level || 1}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="font-bold text-purple-600">{completedLessons}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Avg Score</p>
                            <Badge variant={avgScore >= 80 ? "default" : avgScore >= 60 ? "secondary" : "destructive"}>
                              {avgScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {students.length === 0 && (
                    <p className="text-gray-600 text-center py-8">
                      No students found. Students need to sign up with the same school name to appear here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ClassAnalytics classStats={classStats} students={students} />
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject) => {
                const subjectProgress = recentProgress.filter(
                  (p) => p.lessons?.courses?.subjects?.name === subject.name,
                )
                const completionRate =
                  subjectProgress.length > 0
                    ? Math.round(
                        (subjectProgress.filter((p) => p.status === "completed").length / subjectProgress.length) * 100,
                      )
                    : 0

                return (
                  <Card key={subject.id}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{subject.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{subject.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <p className="text-xs text-gray-600">
                          {subjectProgress.filter((p) => p.status === "completed").length} completed lessons
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
