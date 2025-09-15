import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription>Don't worry! You can still continue learning with cached content.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Your progress will be saved locally and synced automatically when you're back online.
              </p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/student/dashboard">Continue Learning Offline</Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Features available offline: View lessons, take quizzes, track progress
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
