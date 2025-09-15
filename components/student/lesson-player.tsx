"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ConnectionStatus } from "@/components/offline/connection-status"
import Link from "next/link"
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { syncManager } from "@/lib/offline/sync-manager"
import { useRouter } from "next/navigation"

interface LessonPlayerProps {
  lesson: any
  progress: any
  profile: any
  studentPoints: any
}

export function LessonPlayer({ lesson, progress, profile, studentPoints }: LessonPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const questions = lesson.content?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  useEffect(() => {
    if (progress?.status === "completed") {
      setIsCompleted(true)
      setScore(progress.score || 0)
    }

    // Check online status
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [progress])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correct
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (isCorrect) {
      setScore(score + 1)
    }

    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      handleCompleteLesson()
    }
  }

  const handleCompleteLesson = async () => {
    setIsLoading(true)

    const finalScore = Math.round((score / totalQuestions) * 100)
    const pointsToEarn = Math.floor((finalScore * lesson.points_reward) / 100)

    const progressData = {
      student_id: profile.id,
      lesson_id: lesson.id,
      status: "completed",
      score: finalScore,
      attempts: (progress?.attempts || 0) + 1,
      completed_at: new Date().toISOString(),
    }

    try {
      if (isOffline) {
        await syncManager.saveProgressOffline(progressData)

        // Also queue points update for sync
        await syncManager.saveProgressOffline({
          type: "points",
          student_id: profile.id,
          points_to_add: pointsToEarn,
        })

        setPointsEarned(pointsToEarn)
        setIsCompleted(true)
      } else {
        // Update or insert progress
        const { error: progressError } = await supabase.from("student_progress").upsert(progressData)

        if (progressError) throw progressError

        // Update student points
        const { error: pointsError } = await supabase.rpc("update_student_points", {
          p_student_id: profile.id,
          p_points_to_add: pointsToEarn,
        })

        if (pointsError) throw pointsError

        // Update streak
        const { error: streakError } = await supabase.rpc("update_student_streak", {
          p_student_id: profile.id,
        })

        if (streakError) throw streakError

        // Check for achievements
        const { error: achievementError } = await supabase.rpc("check_and_award_achievements", {
          p_student_id: profile.id,
        })

        if (achievementError) throw achievementError

        setPointsEarned(pointsToEarn)
        setIsCompleted(true)
      }
    } catch (error) {
      console.error("Error completing lesson:", error)
      // Fallback to offline mode
      await syncManager.saveProgressOffline(progressData)
      setPointsEarned(pointsToEarn)
      setIsCompleted(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setIsCompleted(false)
    setPointsEarned(0)
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/student/subjects/${lesson.courses.subject_id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {lesson.courses.subjects.name}
              </Button>
            </Link>
            <ConnectionStatus />
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold mb-2">Lesson Content Coming Soon</h3>
              <p className="text-gray-600">Interactive content for "{lesson.title}" is being prepared.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    const finalScore = Math.round((score / totalQuestions) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-end">
            <ConnectionStatus />
          </div>

          <Card className="text-center">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl">Lesson Complete!</CardTitle>
              <CardDescription className="text-green-100 text-lg">
                Great job on completing "{lesson.title}"
              </CardDescription>
              {isOffline && (
                <Badge variant="secondary" className="mt-2">
                  Progress saved offline - will sync when online
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{finalScore}%</div>
                  <div className="text-gray-600">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">+{pointsEarned}</div>
                  <div className="text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {score}/{totalQuestions}
                  </div>
                  <div className="text-gray-600">Correct Answers</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleRestart} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link href={`/student/subjects/${lesson.courses.subject_id}`}>
                  <Button size="lg">Continue Learning</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/student/subjects/${lesson.courses.subject_id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {lesson.courses.subjects.name}
            </Button>
          </Link>
          <ConnectionStatus />
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">{lesson.title}</h1>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{lesson.points_reward} points</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>
                Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
              </span>
            </div>

            <Progress value={((currentQuestionIndex + (showResult ? 1 : 0)) / totalQuestions) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-balance">{currentQuestion.question}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline"
              let buttonClass = ""

              if (showResult) {
                if (index === currentQuestion.correct) {
                  buttonVariant = "default"
                  buttonClass = "bg-green-500 hover:bg-green-600 text-white border-green-500"
                } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                  buttonVariant = "destructive"
                }
              } else if (selectedAnswer === index) {
                buttonVariant = "secondary"
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`w-full p-6 text-left justify-start text-wrap h-auto ${buttonClass}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-balance">{option}</span>
                    {showResult && index === currentQuestion.correct && <CheckCircle className="h-5 w-5 ml-auto" />}
                    {showResult && index === selectedAnswer && index !== currentQuestion.correct && (
                      <XCircle className="h-5 w-5 ml-auto" />
                    )}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Explanation Card */}
        {showResult && currentQuestion.explanation && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} size="lg" className="px-8">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} size="lg" className="px-8" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : currentQuestionIndex < totalQuestions - 1
                  ? "Next Question"
                  : "Complete Lesson"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
