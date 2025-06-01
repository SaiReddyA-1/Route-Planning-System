"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  RotateCcw,
  MapPin,
  Route,
  Trash2,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  FileJson,
  CheckCircle,
} from "lucide-react"
import { GraphVisualizer } from "./graph-visualizer"
import { Graph } from "@/lib/graph"

export default function RoutePlanner() {
  const [graph, setGraph] = useState<Graph>(new Graph())
  const [cityName, setCityName] = useState("")
  const [sourceCity, setSourceCity] = useState("")
  const [targetCity, setTargetCity] = useState("")
  const [sourceCityConnect, setSourceCityConnect] = useState("")
  const [targetCityConnect, setTargetCityConnect] = useState("")
  const [distance, setDistance] = useState<number>(1)
  const [path, setPath] = useState<string[]>([])
  const [totalDistance, setTotalDistance] = useState<number>(0)
  const [isWeighted, setIsWeighted] = useState<boolean>(true)
  const [algorithm, setAlgorithm] = useState<"dijkstra" | "bfs">("dijkstra")
  const [error, setError] = useState<string | null>(null)
  const [useDefaultCities, setUseDefaultCities] = useState<boolean>(true)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentAnimationStep, setCurrentAnimationStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1000) // ms per step

  // Import/Export states
  const [importJson, setImportJson] = useState("")
  const [showImportDialog, setShowImportDialog] = useState(false)

  const defaultCities = [
    // Telangana cities (northern region)
    {
      name: "Hyderabad",
      state: "TS",
      x: 0.5,
      y: 0.3,
      connections: [
        { to: "Warangal", distance: 150 },
        { to: "Nizamabad", distance: 175 },
        { to: "Vijayawada", distance: 275 },
      ],
    },
    {
      name: "Warangal",
      state: "TS",
      x: 0.7,
      y: 0.25,
      connections: [
        { to: "Hyderabad", distance: 150 },
        { to: "Khammam", distance: 120 },
        { to: "Karimnagar", distance: 85 },
      ],
    },
    {
      name: "Nizamabad",
      state: "TS",
      x: 0.3,
      y: 0.15,
      connections: [
        { to: "Hyderabad", distance: 175 },
        { to: "Karimnagar", distance: 100 },
      ],
    },
    {
      name: "Karimnagar",
      state: "TS",
      x: 0.4,
      y: 0.2,
      connections: [
        { to: "Warangal", distance: 85 },
        { to: "Nizamabad", distance: 100 },
      ],
    },
    {
      name: "Khammam",
      state: "TS",
      x: 0.8,
      y: 0.35,
      connections: [{ to: "Warangal", distance: 120 }],
    },

    // Andhra Pradesh cities (southern region)
    {
      name: "Vijayawada",
      state: "AP",
      x: 0.6,
      y: 0.55,
      connections: [
        { to: "Guntur", distance: 35 },
        { to: "Visakhapatnam", distance: 350 },
        { to: "Hyderabad", distance: 275 },
      ],
    },
    {
      name: "Visakhapatnam",
      state: "AP",
      x: 0.9,
      y: 0.45,
      connections: [
        { to: "Vijayawada", distance: 350 },
        { to: "Kakinada", distance: 65 },
        { to: "Rajahmundry", distance: 120 },
      ],
    },
    {
      name: "Guntur",
      state: "AP",
      x: 0.5,
      y: 0.65,
      connections: [
        { to: "Vijayawada", distance: 35 },
        { to: "Ongole", distance: 80 },
        { to: "Nellore", distance: 180 },
      ],
    },
    {
      name: "Tirupati",
      state: "AP",
      x: 0.3,
      y: 0.85,
      connections: [
        { to: "Chittoor", distance: 70 },
        { to: "Nellore", distance: 150 },
        { to: "Kadapa", distance: 120 },
      ],
    },
    {
      name: "Nellore",
      state: "AP",
      x: 0.4,
      y: 0.75,
      connections: [
        { to: "Tirupati", distance: 150 },
        { to: "Guntur", distance: 180 },
        { to: "Ongole", distance: 100 },
      ],
    },
    {
      name: "Kakinada",
      state: "AP",
      x: 0.85,
      y: 0.55,
      connections: [
        { to: "Visakhapatnam", distance: 65 },
        { to: "Rajahmundry", distance: 55 },
      ],
    },
    {
      name: "Rajahmundry",
      state: "AP",
      x: 0.75,
      y: 0.6,
      connections: [
        { to: "Kakinada", distance: 55 },
        { to: "Visakhapatnam", distance: 120 },
      ],
    },
    {
      name: "Chittoor",
      state: "AP",
      x: 0.25,
      y: 0.8,
      connections: [{ to: "Tirupati", distance: 70 }],
    },
    {
      name: "Kadapa",
      state: "AP",
      x: 0.35,
      y: 0.7,
      connections: [{ to: "Tirupati", distance: 120 }],
    },
    {
      name: "Ongole",
      state: "AP",
      x: 0.45,
      y: 0.7,
      connections: [
        { to: "Guntur", distance: 80 },
        { to: "Nellore", distance: 100 },
      ],
    },
  ]

  // Animation functions
  const startPathAnimation = () => {
    if (path.length <= 1) return

    setIsAnimating(true)
    setCurrentAnimationStep(0)
  }

  const stopPathAnimation = () => {
    setIsAnimating(false)
    setCurrentAnimationStep(0)
  }

  const pausePathAnimation = () => {
    setIsAnimating(false)
  }

  // Animation effect
  useEffect(() => {
    if (!isAnimating || currentAnimationStep >= path.length - 1) {
      if (currentAnimationStep >= path.length - 1) {
        setIsAnimating(false)
      }
      return
    }

    const timer = setTimeout(() => {
      setCurrentAnimationStep((prev) => prev + 1)
    }, animationSpeed)

    return () => clearTimeout(timer)
  }, [isAnimating, currentAnimationStep, path.length, animationSpeed])

  // Export graph to JSON
  const exportGraph = () => {
    const graphData = {
      nodes: graph.getNodes(),
      edges: graph.getEdges(),
      positions: Array.from(nodePositions.entries()).map(([nodeId, pos]) => [
        nodeId,
        { x: Math.round(pos.x * 100) / 100, y: Math.round(pos.y * 100) / 100 },
      ]),
      metadata: {
        isWeighted,
        algorithm,
        exportDate: new Date().toISOString(),
        version: "1.0",
        canvasSize: { width: 450, height: 400 },
      },
    }

    const dataStr = JSON.stringify(graphData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `route-graph-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Import graph from JSON
  const importGraph = () => {
    try {
      const graphData = JSON.parse(importJson)

      if (!graphData.nodes || !graphData.edges || !graphData.positions) {
        throw new Error("Invalid graph format")
      }

      const newGraph = new Graph()

      // Add nodes
      graphData.nodes.forEach((node: { id: string }) => {
        newGraph.addNode(node.id)
      })

      // Add edges
      graphData.edges.forEach((edge: { source: string; target: string; weight: number }) => {
        newGraph.addEdge(edge.source, edge.target, edge.weight)
      })

      // Restore exact positions
      const positions = new Map<string, { x: number; y: number }>()
      graphData.positions.forEach(([nodeId, pos]: [string, { x: number; y: number }]) => {
        positions.set(nodeId, { x: pos.x, y: pos.y })
      })

      setGraph(newGraph)
      setNodePositions(positions)

      // Apply metadata if available
      if (graphData.metadata) {
        if (typeof graphData.metadata.isWeighted === "boolean") {
          setIsWeighted(graphData.metadata.isWeighted)
        }
        if (graphData.metadata.algorithm) {
          setAlgorithm(graphData.metadata.algorithm)
        }
      }

      setImportJson("")
      setShowImportDialog(false)
      setError(null)
    } catch (err) {
      setError("Failed to import graph: Invalid JSON format")
    }
  }

  // Add a city to the graph
  const addCity = () => {
    if (!cityName.trim()) {
      setError("City name cannot be empty")
      return
    }

    if (graph.hasNode(cityName)) {
      setError(`City "${cityName}" already exists`)
      return
    }

    const newGraph = new Graph(graph)
    newGraph.addNode(cityName)
    setGraph(newGraph)
    setCityName("")
    setError(null)
  }

  // Connect two cities with a road
  const connectCities = () => {
    if (!sourceCityConnect || !targetCityConnect) {
      setError("Please select both cities")
      return
    }

    if (sourceCityConnect === targetCityConnect) {
      setError("Cannot connect a city to itself")
      return
    }

    if (!graph.hasNode(sourceCityConnect) || !graph.hasNode(targetCityConnect)) {
      setError("One or both cities do not exist")
      return
    }

    const weight = isWeighted ? distance : 1

    const newGraph = new Graph(graph)
    newGraph.addEdge(sourceCityConnect, targetCityConnect, weight)
    setGraph(newGraph)

    // Reset form fields
    setSourceCityConnect("")
    setTargetCityConnect("")
    setDistance(1)
    setError(null)
  }

  // Find the shortest path between two cities
  const findShortestPath = () => {
    if (!sourceCity || !targetCity) {
      setError("Please select both source and target cities")
      return
    }

    if (sourceCity === targetCity) {
      setPath([sourceCity])
      setTotalDistance(0)
      setError(null)
      return
    }

    if (!graph.hasNode(sourceCity) || !graph.hasNode(targetCity)) {
      setError("One or both cities do not exist")
      return
    }

    try {
      const result =
        algorithm === "dijkstra" ? graph.dijkstra(sourceCity, targetCity) : graph.bfs(sourceCity, targetCity)

      setPath(result.path)
      setTotalDistance(result.distance)
      setError(null)

      // Reset animation
      setCurrentAnimationStep(0)
      setIsAnimating(false)
    } catch (err) {
      setError("No path exists between these cities")
      setPath([])
      setTotalDistance(0)
    }
  }

  // Remove a city from the graph
  const removeCity = (city: string) => {
    const newGraph = new Graph(graph)
    newGraph.removeNode(city)
    setGraph(newGraph)

    // Remove from positions
    const newPositions = new Map(nodePositions)
    newPositions.delete(city)
    setNodePositions(newPositions)

    // Reset selections if they include the removed city
    if (sourceCity === city) setSourceCity("")
    if (targetCity === city) setTargetCity("")
    if (sourceCityConnect === city) setSourceCityConnect("")
    if (targetCityConnect === city) setTargetCityConnect("")
  }

  // Handle Enter key press for adding cities
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCity()
    }
  }

  // Handle algorithm change based on weighted/unweighted selection
  useEffect(() => {
    if (isWeighted) {
      setAlgorithm("dijkstra")
    } else {
      setAlgorithm("bfs")
    }
  }, [isWeighted])

  const loadDefaultCities = () => {
    const newGraph = new Graph()
    const newPositions = new Map<string, { x: number; y: number }>()

    // Add all cities first with their positions
    defaultCities.forEach((city) => {
      newGraph.addNode(city.name)
      // Convert relative coordinates to fixed canvas coordinates (450x400)
      const x = city.x * 450
      const y = city.y * 400
      newPositions.set(city.name, { x, y })
    })

    // Add connections
    defaultCities.forEach((city) => {
      city.connections.forEach((connection) => {
        if (newGraph.hasNode(connection.to)) {
          newGraph.addEdge(city.name, connection.to, connection.distance)
        }
      })
    })

    setGraph(newGraph)
    setNodePositions(newPositions)
    setError(null)
  }

  // Save graph state to localStorage with exact coordinates
  const saveGraphState = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const graphData = {
        nodes: graph.getNodes(),
        edges: graph.getEdges(),
        positions: Array.from(nodePositions.entries()).map(([nodeId, pos]) => [
          nodeId,
          { x: Math.round(pos.x * 100) / 100, y: Math.round(pos.y * 100) / 100 },
        ]),
        timestamp: Date.now(),
        metadata: {
          isWeighted,
          algorithm,
          canvasSize: { width: 450, height: 400 },
        },
      }

      localStorage.setItem("routePlannerGraph", JSON.stringify(graphData))

      // Simulate save delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSaveSuccess(true)
      setError(null)

      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error("Failed to save graph state:", error)
      setError("Failed to save graph state")
    } finally {
      setIsSaving(false)
    }
  }

  // Load graph state from localStorage with exact coordinates
  const loadGraphState = () => {
    try {
      const savedData = localStorage.getItem("routePlannerGraph")
      if (savedData) {
        const graphData = JSON.parse(savedData)
        const newGraph = new Graph()

        // Add nodes
        graphData.nodes.forEach((node: { id: string }) => {
          newGraph.addNode(node.id)
        })

        // Add edges
        graphData.edges.forEach((edge: { source: string; target: string; weight: number }) => {
          newGraph.addEdge(edge.source, edge.target, edge.weight)
        })

        // Restore exact positions
        const positions = new Map<string, { x: number; y: number }>()
        if (Array.isArray(graphData.positions)) {
          graphData.positions.forEach(([nodeId, pos]: [string, { x: number; y: number }]) => {
            positions.set(nodeId, { x: pos.x, y: pos.y })
          })
        } else {
          // Handle old format
          const positionsArray = Array.from(graphData.positions || [])
          positionsArray.forEach(([nodeId, pos]: [string, { x: number; y: number }]) => {
            positions.set(nodeId, { x: pos.x, y: pos.y })
          })
        }

        setGraph(newGraph)
        setNodePositions(positions)

        // Apply metadata if available
        if (graphData.metadata) {
          if (typeof graphData.metadata.isWeighted === "boolean") {
            setIsWeighted(graphData.metadata.isWeighted)
          }
          if (graphData.metadata.algorithm) {
            setAlgorithm(graphData.metadata.algorithm)
          }
        }

        return true
      }
    } catch (error) {
      console.error("Failed to load graph state:", error)
    }
    return false
  }

  // Clear saved graph state
  const clearGraphState = () => {
    try {
      localStorage.removeItem("routePlannerGraph")
      const newGraph = new Graph()
      setGraph(newGraph)
      setNodePositions(new Map())
      setError(null)
    } catch (error) {
      console.error("Failed to clear graph state:", error)
    }
  }

  // Update node positions from the visualizer with exact coordinates
  const updateNodePositions = useCallback((newPositions: Map<string, { x: number; y: number }>) => {
    // Round positions to avoid floating point precision issues
    const roundedPositions = new Map<string, { x: number; y: number }>()
    newPositions.forEach((pos, nodeId) => {
      roundedPositions.set(nodeId, {
        x: Math.round(pos.x * 100) / 100,
        y: Math.round(pos.y * 100) / 100,
      })
    })
    setNodePositions(roundedPositions)
  }, [])

  useEffect(() => {
    if (useDefaultCities) {
      // Try to load from localStorage first
      const loaded = loadGraphState()
      if (!loaded) {
        // If no saved state, load default cities
        loadDefaultCities()
      }
    } else {
      // Clear the graph when default cities are disabled
      clearGraphState()
    }
  }, [useDefaultCities])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3">
        <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Graph Visualization
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Interactive map of cities and roads - drag nodes to reposition
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportGraph}
                  variant="outline"
                  size="sm"
                  disabled={graph.getNodes().length === 0}
                  className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={saveGraphState}
                  disabled={isSaving || graph.getNodes().length === 0}
                  className={`shadow-md transition-all ${
                    saveSuccess
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Layout"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[450px] relative border rounded-lg bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50 transition-colors">
            <GraphVisualizer
              graph={graph}
              path={path}
              isWeighted={isWeighted}
              nodePositions={nodePositions}
              onPositionUpdate={updateNodePositions}
              animationStep={currentAnimationStep}
              isAnimating={isAnimating}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                  <Route className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Path Results
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {path.length > 0
                    ? `Shortest path using ${algorithm === "dijkstra" ? "Dijkstra's Algorithm" : "BFS"}`
                    : "Find the optimal route between two cities"}
                </CardDescription>
              </div>
              {path.length > 1 && (
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <Label htmlFor="speed" className="text-sm dark:text-gray-300">
                      Speed:
                    </Label>
                    <Select value={animationSpeed.toString()} onValueChange={(val) => setAnimationSpeed(Number(val))}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">Fast</SelectItem>
                        <SelectItem value="1000">Normal</SelectItem>
                        <SelectItem value="2000">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!isAnimating ? (
                    <Button onClick={startPathAnimation} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-1" />
                      Animate
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button onClick={pausePathAnimation} size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button onClick={stopPathAnimation} size="sm" variant="outline">
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {path.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {path.map((city, index) => (
                    <div key={city} className="flex items-center">
                      <Badge
                        variant="secondary"
                        className={`px-3 py-1 border-blue-200 dark:border-blue-700 transition-all duration-300 ${
                          isAnimating && index <= currentAnimationStep
                            ? "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 text-green-800 dark:text-green-200 scale-110"
                            : index === currentAnimationStep && isAnimating
                              ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-800 dark:text-yellow-200 scale-105"
                              : "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {city}
                      </Badge>
                      {index < path.length - 1 && (
                        <span
                          className={`mx-2 transition-colors duration-300 ${
                            isAnimating && index < currentAnimationStep
                              ? "text-green-500 dark:text-green-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Total distance: <span className="text-lg font-bold">{totalDistance}</span>{" "}
                    {isWeighted ? "units" : "hops"}
                  </p>
                  {isAnimating && (
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Step {currentAnimationStep + 1} of {path.length}
                    </p>
                  )}
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Select source and target cities to find the optimal path
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-1">
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger
              value="manage"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-xs"
            >
              Manage
            </TabsTrigger>
            <TabsTrigger
              value="find"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-xs"
            >
              Find Path
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm text-xs"
            >
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            <Card className="shadow-md border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg dark:text-white">Add City</CardTitle>
                <CardDescription className="dark:text-gray-300">Add a new city to the network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cityName" className="text-sm font-medium dark:text-gray-200">
                    City Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cityName"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter city name"
                      className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button onClick={addCity} size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg border dark:border-gray-600">
                    <div>
                      <Label htmlFor="isWeighted" className="text-sm font-medium dark:text-gray-200">
                        Graph Type
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {isWeighted ? "Weighted (with distances)" : "Unweighted (equal hops)"}
                      </p>
                    </div>
                    <Switch id="isWeighted" checked={isWeighted} onCheckedChange={setIsWeighted} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg border dark:border-gray-600">
                    <div>
                      <Label htmlFor="useDefaultCities" className="text-sm font-medium dark:text-gray-200">
                        Default Cities
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {useDefaultCities ? "AP & TS cities loaded" : "Manual mode"}
                      </p>
                    </div>
                    <Switch id="useDefaultCities" checked={useDefaultCities} onCheckedChange={setUseDefaultCities} />
                  </div>

                  {useDefaultCities && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={loadDefaultCities} className="flex-1" size="sm">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                      <Button variant="outline" onClick={clearGraphState} className="flex-1" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium dark:text-gray-200">Connect Cities</Label>
                  <Select value={sourceCityConnect} onValueChange={setSourceCityConnect}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Source City" />
                    </SelectTrigger>
                    <SelectContent>
                      {graph.getNodes().map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={targetCityConnect} onValueChange={setTargetCityConnect}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Target City" />
                    </SelectTrigger>
                    <SelectContent>
                      {graph.getNodes().map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isWeighted && (
                    <div className="space-y-2">
                      <Label htmlFor="distance" className="text-sm font-medium dark:text-gray-200">
                        Distance
                      </Label>
                      <Input
                        id="distance"
                        type="number"
                        min="0"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="Enter distance"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}

                  <Button onClick={connectCities} className="w-full bg-green-600 hover:bg-green-700 shadow-sm">
                    Connect Cities
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg dark:text-white">City List</CardTitle>
                <CardDescription className="dark:text-gray-300">Manage existing cities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {graph.getNodes().length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No cities added yet</p>
                  ) : (
                    graph.getNodes().map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg border dark:border-gray-600"
                      >
                        <span className="text-sm font-medium dark:text-gray-200">{node.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCity(node.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find" className="space-y-4">
            <Card className="shadow-md border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg dark:text-white">Find Shortest Path</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Using {isWeighted ? "Dijkstra's algorithm" : "BFS algorithm"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-200">Source City</Label>
                  <Select value={sourceCity} onValueChange={setSourceCity}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select source city" />
                    </SelectTrigger>
                    <SelectContent>
                      {graph.getNodes().map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-200">Target City</Label>
                  <Select value={targetCity} onValueChange={setTargetCity}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select target city" />
                    </SelectTrigger>
                    <SelectContent>
                      {graph.getNodes().map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-200">Algorithm</Label>
                  <Select
                    value={algorithm}
                    onValueChange={(val: "dijkstra" | "bfs") => setAlgorithm(val)}
                    disabled={!isWeighted}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                      <SelectItem value="bfs" disabled={isWeighted}>
                        BFS (Unweighted only)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isWeighted ? "Finds shortest weighted path" : "Finds path with fewest hops"}
                  </p>
                </div>

                <Button onClick={findShortestPath} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  <Route className="h-4 w-4 mr-2" />
                  Find Path
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card className="shadow-md border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Import Graph
                </CardTitle>
                <CardDescription className="dark:text-gray-300">Import graph from JSON file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="importJson" className="text-sm font-medium dark:text-gray-200">
                    JSON Data
                  </Label>
                  <Textarea
                    id="importJson"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="Paste your graph JSON here..."
                    className="min-h-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={importGraph}
                    disabled={!importJson.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" onClick={() => setImportJson("")} className="flex-1">
                    Clear
                  </Button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• Export a graph first to see the JSON format</p>
                  <p>• Imported graphs will replace the current graph</p>
                  <p>• Node positions and metadata will be preserved</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
