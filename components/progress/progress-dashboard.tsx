"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Trophy, Target, TrendingUp, Star, Calendar } from "lucide-react"

interface ProgressDashboardProps {
  studentId: string
}

export function ProgressDashboard({ studentId }: ProgressDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [studentId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/student/${studentId}`)
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No progress data available</p>
        </CardContent>
      </Card>
    )
  }

  const completionRate =
    analytics.totalLessons > 0 ? Math.round((analytics.completedLessons / analytics.totalLessons) * 100) : 0

  const subjectData = Object.values(analytics.subjectProgress).map((subject: any) => ({
    name: subject.name,
    completed: subject.completed,
    total: subject.total,
    completionRate: subject.completionRate,
    averageScore: subject.averageScore,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.completedLessons}/{analytics.totalLessons}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={completionRate} className="mt-3" />
            <p className="text-xs text-gray-500 mt-1">{completionRate}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{analytics.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-3">
              <Badge
                variant={
                  analytics.averageScore >= 80 ? "default" : analytics.averageScore >= 60 ? "secondary" : "destructive"
                }
              >
                {analytics.averageScore >= 80
                  ? "Excellent"
                  : analytics.averageScore >= 60
                    ? "Good"
                    : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.currentStreak} days</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-3">
              <Badge variant="outline">
                {analytics.currentStreak >= 7
                  ? "🔥 On Fire!"
                  : analytics.currentStreak >= 3
                    ? "📈 Building"
                    : "💪 Keep Going"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.points.toLocaleString()}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-3">
              <Badge variant="secondary">Level {analytics.level}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subject Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress by Subject</CardTitle>
                <CardDescription>Completion rates across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Average scores by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, averageScore }) => `${name}: ${averageScore}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="averageScore"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectData.map((subject, index) => (
              <Card key={subject.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{subject.name}</h4>
                    <Badge variant="outline">{subject.completionRate}%</Badge>
                  </div>
                  <Progress value={subject.completionRate} className="mb-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {subject.completed}/{subject.total} lessons
                    </span>
                    <span>Avg: {subject.averageScore}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest completed lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.lessonTitle}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.courseTitle} • {activity.subjectName}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.score >= 80 ? "default" : activity.score >= 60 ? "secondary" : "destructive"
                          }
                        >
                          {activity.score}%
                        </Badge>
                        <p className="text-sm text-green-600 mt-1">+{activity.pointsEarned} points</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your earned badges and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.achievements.length > 0 ? (
                  analytics.achievements.map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center p-4 border rounded-lg">
                      <div className="text-3xl mr-3">{achievement.achievements.icon}</div>
                      <div>
                        <h4 className="font-medium">{achievement.achievements.name}</h4>
                        <p className="text-sm text-gray-600">{achievement.achievements.description}</p>
                        <Badge variant="secondary" className="mt-1">
                          +{achievement.achievements.points_reward} points
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No achievements yet. Keep learning to earn your first badge!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
