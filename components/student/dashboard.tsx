"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Trophy, Star, Flame, BookOpen, Clock, Target } from "lucide-react"

interface StudentDashboardProps {
  profile: any
  studentPoints: any
  achievements: any[]
  subjects: any[]
  recentProgress: any[]
}

export function StudentDashboard({
  profile,
  studentPoints,
  achievements,
  subjects,
  recentProgress,
}: StudentDashboardProps) {
  const { t } = useI18n()
  const currentLevelProgress = studentPoints ? ((studentPoints.total_points % 100) / 100) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("welcomeBackStudent")}, {profile?.full_name?.split(" ")[0] || "Student"}! 🎮
            </h1>
            <p className="text-gray-600">{t("readyToContinue")}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right">
              <div className="text-sm text-gray-600">{t("currentStreak")}</div>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-orange-600">{studentPoints?.current_streak || 0} days</span>
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
                  <p className="text-blue-100">{t("totalPoints")}</p>
                  <p className="text-2xl font-bold">{studentPoints?.total_points || 0}</p>
                </div>
                <Star className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">{t("level")}</p>
                  <p className="text-2xl font-bold">{studentPoints?.level || 1}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">{t("achievements")}</p>
                  <p className="text-2xl font-bold">{achievements?.length || 0}</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">{t("bestStreak")}</p>
                  <p className="text-2xl font-bold">{studentPoints?.longest_streak || 0}</p>
                </div>
                <Flame className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t("levelProgress")}
              </CardTitle>
              <CardDescription>
                {t("level")} {studentPoints?.level || 1} • {studentPoints?.total_points || 0}{" "}
                {t("totalPoints").toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Progress to {t("level")} {(studentPoints?.level || 1) + 1}
                  </span>
                  <span>{Math.floor(currentLevelProgress)}%</span>
                </div>
                <Progress value={currentLevelProgress} className="h-3" />
                <p className="text-xs text-gray-600">
                  {100 - Math.floor(currentLevelProgress)} {t("points").toLowerCase()} until next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t("recentAchievements")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements?.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.achievements.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.achievements.name}</p>
                      <p className="text-xs text-gray-600">{achievement.achievements.description}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-600">No achievements yet. Start learning to earn your first badge!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {t("chooseSubject")}
            </CardTitle>
            <CardDescription>{t("selectSubject")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects?.map((subject) => (
                <Link key={subject.id} href={`/student/subjects/${subject.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{subject.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">
                        {t(subject.name.toLowerCase() as any) || subject.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
                      <Button size="sm" className="w-full">
                        {t("startLearning")}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )) || <p className="col-span-full text-center text-gray-600">No subjects available yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {recentProgress && recentProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                {t("recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProgress.map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{progress.lessons?.courses?.subjects?.icon}</div>
                      <div>
                        <p className="font-medium">{progress.lessons?.title}</p>
                        <p className="text-sm text-gray-600">
                          {progress.lessons?.courses?.title} • {progress.lessons?.courses?.subjects?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                        {t(progress.status as any) || progress.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("score")}: {progress.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
