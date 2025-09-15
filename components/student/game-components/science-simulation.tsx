"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface ScienceSimulationProps {
  onComplete: (score: number) => void
  topic: "ecosystem" | "physics" | "chemistry"
}

export function ScienceSimulation({ onComplete, topic }: ScienceSimulationProps) {
  const [temperature, setTemperature] = useState([20])
  const [humidity, setHumidity] = useState([50])
  const [lightLevel, setLightLevel] = useState([50])
  const [results, setResults] = useState<string[]>([])
  const [experimentsRun, setExperimentsRun] = useState(0)
  const [score, setScore] = useState(0)

  const runExperiment = () => {
    const temp = temperature[0]
    const hum = humidity[0]
    const light = lightLevel[0]

    let result = ""
    let points = 0

    // Ecosystem simulation logic
    if (topic === "ecosystem") {
      if (temp >= 15 && temp <= 25 && hum >= 40 && hum <= 70 && light >= 30) {
        result = "🌱 Plants are thriving! Perfect conditions for growth."
        points = 10
      } else if (temp < 10 || temp > 35) {
        result = "🥶 Temperature is too extreme! Plants are struggling."
        points = 2
      } else if (hum < 20) {
        result = "🏜️ Too dry! Plants are wilting from lack of moisture."
        points = 3
      } else if (light < 20) {
        result = "🌑 Not enough light! Plants can't photosynthesize properly."
        points = 4
      } else {
        result = "🌿 Plants are surviving but not optimal conditions."
        points = 6
      }
    }

    setResults([...results, result])
    setScore(score + points)
    setExperimentsRun(experimentsRun + 1)

    if (experimentsRun + 1 >= 5) {
      setTimeout(() => {
        onComplete(Math.round(((score + points) / 50) * 100))
      }, 2000)
    }
  }

  const resetSimulation = () => {
    setTemperature([20])
    setHumidity([50])
    setLightLevel([50])
    setResults([])
    setExperimentsRun(0)
    setScore(0)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Ecosystem Simulation
          <Badge variant="secondary">Experiment {experimentsRun}/5</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">🌍</div>
          <p className="text-sm text-gray-700">
            Adjust the environmental conditions and observe how plants respond. Try to find the optimal conditions for
            plant growth!
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Temperature: {temperature[0]}°C</label>
            <Slider value={temperature} onValueChange={setTemperature} max={40} min={-10} step={1} className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Humidity: {humidity[0]}%</label>
            <Slider value={humidity} onValueChange={setHumidity} max={100} min={0} step={5} className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Light Level: {lightLevel[0]}%</label>
            <Slider value={lightLevel} onValueChange={setLightLevel} max={100} min={0} step={5} className="w-full" />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={runExperiment} disabled={experimentsRun >= 5} className="flex-1">
            Run Experiment
          </Button>
          <Button onClick={resetSimulation} variant="outline">
            Reset
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Results:</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  <strong>Experiment {index + 1}:</strong> {result}
                </div>
              ))}
            </div>
            <div className="text-center font-medium">Current Score: {score}/50 points</div>
          </div>
        )}

        {experimentsRun >= 5 && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🎉</div>
            <p className="font-medium">Simulation Complete!</p>
            <p className="text-sm text-gray-600">Final Score: {Math.round((score / 50) * 100)}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
