"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { Graph } from "@/lib/graph"

interface GraphVisualizerProps {
  graph: Graph
  path: string[]
  isWeighted: boolean
}

export function GraphVisualizer({ graph, path, isWeighted }: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState<string | null>(null)

  // Initialize node positions
  useEffect(() => {
    const nodes = graph.getNodes()
    const newPositions = new Map(nodePositions)

    // Add positions for new nodes
    nodes.forEach((node) => {
      if (!newPositions.has(node.id)) {
        // Place new nodes in a circle layout
        const angle = Math.random() * Math.PI * 2
        const radius = Math.min(dimensions.width, dimensions.height) * 0.35
        const x = dimensions.width / 2 + radius * Math.cos(angle)
        const y = dimensions.height / 2 + radius * Math.sin(angle)
        newPositions.set(node.id, { x, y })
      }
    })

    // Remove positions for deleted nodes
    for (const nodeId of newPositions.keys()) {
      if (!nodes.some((n) => n.id === nodeId)) {
        newPositions.delete(nodeId)
      }
    }

    setNodePositions(newPositions)
  }, [graph, dimensions])

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height,
        })

        // Update canvas resolution
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const nodes = graph.getNodes()
    const edges = graph.getEdges()

    // Create a map for path edges to highlight them
    const pathEdges = new Map<string, boolean>()
    for (let i = 0; i < path.length - 1; i++) {
      const edgeKey = `${path[i]}-${path[i + 1]}`
      pathEdges.set(edgeKey, true)
    }

    // Draw edges
    edges.forEach((edge) => {
      const sourcePos = nodePositions.get(edge.source)
      const targetPos = nodePositions.get(edge.target)

      if (sourcePos && targetPos) {
        const isPathEdge =
          pathEdges.has(`${edge.source}-${edge.target}`) || pathEdges.has(`${edge.target}-${edge.source}`)

        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)

        if (isPathEdge) {
          ctx.strokeStyle = "#0ea5e9" // Highlight path edges
          ctx.lineWidth = 3
        } else {
          ctx.strokeStyle = "#94a3b8"
          ctx.lineWidth = 1.5
        }

        ctx.stroke()

        // Draw weight if it's a weighted graph
        if (isWeighted) {
          const midX = (sourcePos.x + targetPos.x) / 2
          const midY = (sourcePos.y + targetPos.y) / 2

          // Draw weight background
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(midX, midY, 12, 0, Math.PI * 2)
          ctx.fill()

          // Draw weight text
          ctx.fillStyle = isPathEdge ? "#0ea5e9" : "#64748b"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(edge.weight.toString(), midX, midY)
        }
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const pos = nodePositions.get(node.id)
      if (!pos) return

      const isPathNode = path.includes(node.id)

      // Draw node circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2)

      if (isPathNode) {
        ctx.fillStyle = "#0ea5e9" // Highlight path nodes
      } else {
        ctx.fillStyle = "#f1f5f9"
      }

      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 1.5
      ctx.fill()
      ctx.stroke()

      // Draw node label
      ctx.fillStyle = isPathNode ? "white" : "#334155"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.id, pos.x, pos.y)
    })
  }, [graph, nodePositions, path, dimensions, isWeighted])

  // Handle mouse events for dragging nodes
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if a node was clicked
    for (const [nodeId, pos] of nodePositions.entries()) {
      const dx = pos.x - x
      const dy = pos.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= 20) {
        setIsDragging(nodeId)
        break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update node position
    setNodePositions((prev) => {
      const newPositions = new Map(prev)
      newPositions.set(isDragging, { x, y })
      return newPositions
    })
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
