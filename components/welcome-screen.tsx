"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n/context"

export function WelcomeScreen() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">🎮📚</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-balance">{t("welcomeTitle")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">{t("welcomeDescription")}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="text-3xl mb-2">🎯</div>
              <CardTitle>Interactive Games</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Learn through math puzzles, science simulations, and engaging quizzes that make learning fun.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="text-3xl mb-2">🌐</div>
              <CardTitle>Multilingual</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Content available in English and regional languages like Hindi, Kannada, and Tamil.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="text-3xl mb-2">📱</div>
              <CardTitle>Offline Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works on low-cost devices without internet. Progress syncs automatically when connected.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/sign-up">{t("startLearning")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
            <Link href="/auth/login">{t("signIn")}</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
          <div>
            <div className="text-2xl font-bold text-blue-600">15%+</div>
            <div className="text-sm text-gray-600">Engagement Boost</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-gray-600">STEM Subjects</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">6-12</div>
            <div className="text-sm text-gray-600">Grade Levels</div>
          </div>
        </div>
      </div>
    </div>
  )
}
