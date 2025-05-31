export interface Node {
  id: string
}

export interface Edge {
  source: string
  target: string
  weight: number
}

export class Graph {
  private nodes: Map<string, Node>
  private adjacencyList: Map<string, Map<string, number>>

  constructor(graph?: Graph) {
    if (graph) {
      // Clone the graph
      this.nodes = new Map(graph.nodes)
      this.adjacencyList = new Map()

      // Deep copy of adjacency list
      for (const [nodeId, edges] of graph.adjacencyList.entries()) {
        this.adjacencyList.set(nodeId, new Map(edges))
      }
    } else {
      // Create a new empty graph
      this.nodes = new Map()
      this.adjacencyList = new Map()
    }
  }

  // Add a node to the graph
  addNode(id: string): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id })
      this.adjacencyList.set(id, new Map())
    }
  }

  // Remove a node from the graph
  removeNode(id: string): void {
    // Remove the node
    this.nodes.delete(id)

    // Remove all edges connected to this node
    this.adjacencyList.delete(id)

    // Remove edges from other nodes to this node
    for (const [nodeId, edges] of this.adjacencyList.entries()) {
      edges.delete(id)
    }
  }

  // Check if a node exists
  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  // Get all nodes
  getNodes(): Node[] {
    return Array.from(this.nodes.values())
  }

  // Add an edge between two nodes
  addEdge(source: string, target: string, weight = 1): void {
    // Ensure both nodes exist
    if (!this.nodes.has(source)) {
      this.addNode(source)
    }
    if (!this.nodes.has(target)) {
      this.addNode(target)
    }

    // Add bidirectional edges (undirected graph)
    this.adjacencyList.get(source)!.set(target, weight)
    this.adjacencyList.get(target)!.set(source, weight)
  }

  // Remove an edge between two nodes
  removeEdge(source: string, target: string): void {
    if (this.adjacencyList.has(source)) {
      this.adjacencyList.get(source)!.delete(target)
    }
    if (this.adjacencyList.has(target)) {
      this.adjacencyList.get(target)!.delete(source)
    }
  }

  // Get all edges
  getEdges(): Edge[] {
    const edges: Edge[] = []
    const visited = new Set<string>()

    for (const [source, targets] of this.adjacencyList.entries()) {
      for (const [target, weight] of targets.entries()) {
        // Create a unique edge identifier to avoid duplicates
        const edgeId = [source, target].sort().join("-")

        if (!visited.has(edgeId)) {
          edges.push({ source, target, weight })
          visited.add(edgeId)
        }
      }
    }

    return edges
  }

  // Get neighbors of a node
  getNeighbors(nodeId: string): Map<string, number> | undefined {
    return this.adjacencyList.get(nodeId)
  }

  // Dijkstra's algorithm for finding the shortest path in a weighted graph
  dijkstra(start: string, end: string): { path: string[]; distance: number } {
    if (!this.nodes.has(start) || !this.nodes.has(end)) {
      throw new Error("Start or end node does not exist")
    }

    // Initialize distances and previous nodes
    const distances = new Map<string, number>()
    const previous = new Map<string, string | null>()
    const unvisited = new Set<string>()

    // Set initial distances to Infinity except for the start node
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === start ? 0 : Number.POSITIVE_INFINITY)
      previous.set(nodeId, null)
      unvisited.add(nodeId)
    }

    while (unvisited.size > 0) {
      // Find the unvisited node with the smallest distance
      let current: string | null = null
      let smallestDistance = Number.POSITIVE_INFINITY

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!
        if (distance < smallestDistance) {
          smallestDistance = distance
          current = nodeId
        }
      }

      // If we can't find a node or we've reached the end, break
      if (current === null || current === end || smallestDistance === Number.POSITIVE_INFINITY) {
        break
      }

      // Remove the current node from unvisited
      unvisited.delete(current)

      // Update distances to neighbors
      const neighbors = this.adjacencyList.get(current)
      if (neighbors) {
        for (const [neighbor, weight] of neighbors.entries()) {
          if (unvisited.has(neighbor)) {
            const newDistance = distances.get(current)! + weight
            if (newDistance < distances.get(neighbor)!) {
              distances.set(neighbor, newDistance)
              previous.set(neighbor, current)
            }
          }
        }
      }
    }

    // Reconstruct the path
    const path: string[] = []
    let current: string | null = end

    // If there's no path to the end node
    if (previous.get(end) === null && end !== start) {
      throw new Error("No path exists")
    }

    while (current !== null) {
      path.unshift(current)
      current = previous.get(current)!
    }

    return {
      path,
      distance: distances.get(end)!,
    }
  }

  // BFS algorithm for finding the shortest path in an unweighted graph
  bfs(start: string, end: string): { path: string[]; distance: number } {
    if (!this.nodes.has(start) || !this.nodes.has(end)) {
      throw new Error("Start or end node does not exist")
    }

    // If start and end are the same
    if (start === end) {
      return { path: [start], distance: 0 }
    }

    // Initialize queue, visited set, and previous nodes map
    const queue: string[] = [start]
    const visited = new Set<string>([start])
    const previous = new Map<string, string | null>()
    previous.set(start, null)

    while (queue.length > 0) {
      const current = queue.shift()!

      // If we've reached the end node
      if (current === end) {
        break
      }

      // Visit all neighbors
      const neighbors = this.adjacencyList.get(current)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
            previous.set(neighbor, current)
          }
        }
      }
    }

    // If end node was not reached
    if (!previous.has(end)) {
      throw new Error("No path exists")
    }

    // Reconstruct the path
    const path: string[] = []
    let current: string | null = end

    while (current !== null) {
      path.unshift(current)
      current = previous.get(current)!
    }

    // Calculate distance (number of edges)
    const distance = path.length - 1

    return { path, distance }
  }
}
