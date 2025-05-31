"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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

    // Reset selections if they include the removed city
    if (sourceCity === city) setSourceCity("")
    if (targetCity === city) setTargetCity("")
    if (sourceCityConnect === city) setSourceCityConnect("")
    if (targetCityConnect === city) setTargetCityConnect("")
  }

  // Handle algorithm change based on weighted/unweighted selection
  useEffect(() => {
    if (isWeighted) {
      setAlgorithm("dijkstra")
    } else {
      setAlgorithm("bfs")
    }
  }, [isWeighted])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Graph Visualization</CardTitle>
            <CardDescription>Visual representation of cities and roads</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px] relative border rounded-md">
            <GraphVisualizer graph={graph} path={path} isWeighted={isWeighted} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Path Results</CardTitle>
            <CardDescription>
              {path.length > 0
                ? `Shortest path using ${algorithm === "dijkstra" ? "Dijkstra's Algorithm" : "BFS"}`
                : "Find a path between two cities"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {path.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  {path.map((city, index) => (
                    <div key={city} className="flex items-center">
                      <span className="px-3 py-1 bg-primary/10 rounded-md">{city}</span>
                      {index < path.length - 1 && <span className="mx-1">→</span>}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total distance: <span className="font-medium">{totalDistance}</span> {isWeighted ? "units" : "hops"}
                </p>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Select source and target cities to find a path</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Cities</TabsTrigger>
            <TabsTrigger value="find">Find Path</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Add City</CardTitle>
                <CardDescription>Add a new city to the map</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cityName">City Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cityName"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        placeholder="Enter city name"
                      />
                      <Button onClick={addCity}>Add</Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isWeighted">Graph Type</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{isWeighted ? "Weighted" : "Unweighted"}</span>
                        <Switch id="isWeighted" checked={isWeighted} onCheckedChange={setIsWeighted} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isWeighted
                        ? "Using Dijkstra's algorithm for weighted graphs"
                        : "Using BFS algorithm for unweighted graphs"}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Connect Cities</Label>
                    <Select value={sourceCityConnect} onValueChange={setSourceCityConnect}>
                      <SelectTrigger>
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
                  </div>

                  <div className="grid gap-2">
                    <Select value={targetCityConnect} onValueChange={setTargetCityConnect}>
                      <SelectTrigger>
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
                  </div>

                  {isWeighted && (
                    <div className="grid gap-2">
                      <Label htmlFor="distance">Distance</Label>
                      <Input
                        id="distance"
                        type="number"
                        min="1"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value) || 1)}
                      />
                    </div>
                  )}

                  <Button onClick={connectCities}>Connect Cities</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>City List</CardTitle>
                <CardDescription>Manage existing cities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {graph.getNodes().length === 0 ? (
                    <p className="text-sm text-muted-foreground">No cities added yet</p>
                  ) : (
                    graph.getNodes().map((node) => (
                      <div key={node.id} className="flex items-center justify-between py-2 border-b">
                        <span>{node.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCity(node.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find">
            <Card>
              <CardHeader>
                <CardTitle>Find Shortest Path</CardTitle>
                <CardDescription>
                  Find the shortest path between two cities using {isWeighted ? "Dijkstra's algorithm" : "BFS"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Source City</Label>
                    <Select value={sourceCity} onValueChange={setSourceCity}>
                      <SelectTrigger>
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

                  <div className="grid gap-2">
                    <Label>Target City</Label>
                    <Select value={targetCity} onValueChange={setTargetCity}>
                      <SelectTrigger>
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

                  <div className="grid gap-2">
                    <Label>Algorithm</Label>
                    <Select
                      value={algorithm}
                      onValueChange={(val: "dijkstra" | "bfs") => setAlgorithm(val)}
                      disabled={!isWeighted}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                        <SelectItem value="bfs" disabled={isWeighted}>
                          BFS (Unweighted only)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {isWeighted
                        ? "Dijkstra's algorithm is used for weighted graphs"
                        : "BFS is used for unweighted graphs"}
                    </p>
                  </div>

                  <Button onClick={findShortestPath}>Find Path</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
