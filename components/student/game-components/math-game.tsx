"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Timer } from "lucide-react"

interface MathGameProps {
  onComplete: (score: number) => void
  difficulty: "easy" | "medium" | "hard"
}

export function MathGame({ onComplete, difficulty }: MathGameProps) {
  const [currentProblem, setCurrentProblem] = useState<{
    question: string
    answer: number
  } | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [problemCount, setProblemCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(true)

  const totalProblems = 10

  const generateProblem = () => {
    let num1, num2, operation, question, answer

    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        operation = Math.random() > 0.5 ? "+" : "-"
        if (operation === "-" && num1 < num2) [num1, num2] = [num2, num1]
        question = `${num1} ${operation} ${num2}`
        answer = operation === "+" ? num1 + num2 : num1 - num2
        break
      case "medium":
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        operation = ["×", "÷"][Math.floor(Math.random() * 2)]
        if (operation === "÷") {
          answer = Math.floor(Math.random() * 12) + 1
          num1 = answer * num2
        }
        question = `${num1} ${operation} ${num2}`
        answer = operation === "×" ? num1 * num2 : num1 / num2
        break
      case "hard":
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * 20) + 10
        operation = ["+", "-", "×"][Math.floor(Math.random() * 3)]
        question = `${num1} ${operation} ${num2}`
        switch (operation) {
          case "+":
            answer = num1 + num2
            break
          case "-":
            answer = num1 - num2
            break
          case "×":
            answer = num1 * num2
            break
          default:
            answer = 0
        }
        break
      default:
        num1 = 1
        num2 = 1
        question = "1 + 1"
        answer = 2
    }

    return { question, answer }
  }

  useEffect(() => {
    setCurrentProblem(generateProblem())
  }, [difficulty])

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }
  }, [timeLeft, gameActive])

  const handleTimeUp = () => {
    setGameActive(false)
    onComplete(Math.round((score / totalProblems) * 100))
  }

  const handleSubmit = () => {
    if (!currentProblem || !gameActive) return

    const correct = Number.parseInt(userAnswer) === currentProblem.answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (problemCount + 1 >= totalProblems) {
        setGameActive(false)
        onComplete(Math.round(((score + (correct ? 1 : 0)) / totalProblems) * 100))
      } else {
        setProblemCount(problemCount + 1)
        setCurrentProblem(generateProblem())
        setUserAnswer("")
        setShowResult(false)
        setTimeLeft(30)
      }
    }, 1500)
  }

  if (!gameActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Game Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <div className="text-2xl font-bold">
            Score: {score}/{totalProblems}
          </div>
          <div className="text-lg text-gray-600">{Math.round((score / totalProblems) * 100)}% Correct</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Math Challenge</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4" />
            {timeLeft}s
          </div>
        </div>
        <Progress value={(problemCount / totalProblems) * 100} className="h-2" />
        <div className="text-sm text-gray-600 text-center">
          Problem {problemCount + 1} of {totalProblems} • Score: {score}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentProblem && (
          <>
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">{currentProblem.question} = ?</div>

              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer"
                className="text-center text-2xl h-16"
                disabled={showResult}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {showResult && (
              <div
                className={`text-center p-4 rounded-lg ${
                  isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <span className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</span>
                </div>
                {!isCorrect && <div>The correct answer is {currentProblem.answer}</div>}
              </div>
            )}

            {!showResult && (
              <Button onClick={handleSubmit} disabled={!userAnswer.trim()} className="w-full" size="lg">
                Submit Answer
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
