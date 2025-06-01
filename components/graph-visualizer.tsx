"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { Graph } from "@/lib/graph"

interface GraphVisualizerProps {
  graph: Graph
  path: string[]
  isWeighted: boolean
  nodePositions: Map<string, { x: number; y: number }>
  onPositionUpdate: (positions: Map<string, { x: number; y: number }>) => void
  animationStep?: number
  isAnimating?: boolean
}

interface TooltipData {
  nodeId: string
  x: number
  y: number
  neighbors: string[]
  position: { x: number; y: number }
}

export function GraphVisualizer({
  graph,
  path,
  isWeighted,
  nodePositions,
  onPositionUpdate,
  animationStep = 0,
  isAnimating = false,
}: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [localPositions, setLocalPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  // Sync with parent positions
  useEffect(() => {
    setLocalPositions(new Map(nodePositions))
  }, [nodePositions])

  // Initialize positions for new nodes
  useEffect(() => {
    const nodes = graph.getNodes()
    const newPositions = new Map(localPositions)
    let hasNewNodes = false

    // Add positions for new nodes
    nodes.forEach((node) => {
      if (!newPositions.has(node.id)) {
        // Place new nodes in a random but reasonable position
        const angle = Math.random() * Math.PI * 2
        const radius = 80 + Math.random() * 80
        const x = 225 + radius * Math.cos(angle)
        const y = 200 + radius * Math.sin(angle)
        newPositions.set(node.id, { x: Math.max(20, Math.min(430, x)), y: Math.max(20, Math.min(380, y)) })
        hasNewNodes = true
      }
    })

    // Remove positions for deleted nodes
    for (const nodeId of newPositions.keys()) {
      if (!nodes.some((n) => n.id === nodeId)) {
        newPositions.delete(nodeId)
        hasNewNodes = true
      }
    }

    if (hasNewNodes) {
      setLocalPositions(newPositions)
      onPositionUpdate(newPositions)
    }
  }, [graph, localPositions, onPositionUpdate])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      canvas.width = 450
      canvas.height = 400
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
    const animatedPathEdges = new Map<string, boolean>()

    for (let i = 0; i < path.length - 1; i++) {
      const edgeKey = `${path[i]}-${path[i + 1]}`
      pathEdges.set(edgeKey, true)

      // For animation, only highlight edges up to current step
      if (isAnimating && i < animationStep) {
        animatedPathEdges.set(edgeKey, true)
      }
    }

    // Draw edges
    edges.forEach((edge) => {
      const sourcePos = localPositions.get(edge.source)
      const targetPos = localPositions.get(edge.target)

      if (sourcePos && targetPos) {
        const isPathEdge =
          pathEdges.has(`${edge.source}-${edge.target}`) || pathEdges.has(`${edge.target}-${edge.source}`)
        const isAnimatedEdge =
          animatedPathEdges.has(`${edge.source}-${edge.target}`) ||
          animatedPathEdges.has(`${edge.target}-${edge.source}`)

        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)

        if (isAnimating && isAnimatedEdge) {
          ctx.strokeStyle = "#10b981" // Green for animated path
          ctx.lineWidth = 4
        } else if (isPathEdge && !isAnimating) {
          ctx.strokeStyle = "#0ea5e9" // Blue for static path
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
          if (isAnimating && isAnimatedEdge) {
            ctx.fillStyle = "#10b981"
          } else if (isPathEdge && !isAnimating) {
            ctx.fillStyle = "#0ea5e9"
          } else {
            ctx.fillStyle = "#64748b"
          }
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(edge.weight.toString(), midX, midY)
        }
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const pos = localPositions.get(node.id)
      if (!pos) return

      const isPathNode = path.includes(node.id)
      const isHovered = hoveredNode === node.id
      const isCurrentAnimationNode = isAnimating && path[animationStep] === node.id
      const isAnimatedNode = isAnimating && path.slice(0, animationStep + 1).includes(node.id)

      let nodeRadius = 15
      if (isHovered) nodeRadius = 18
      if (isCurrentAnimationNode) nodeRadius = 20

      // Draw node circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)

      if (isCurrentAnimationNode) {
        ctx.fillStyle = "#fbbf24" // Yellow for current animation node
      } else if (isAnimating && isAnimatedNode) {
        ctx.fillStyle = "#10b981" // Green for visited nodes in animation
      } else if (isPathNode && !isAnimating) {
        ctx.fillStyle = "#0ea5e9" // Blue for path nodes
      } else if (isHovered) {
        ctx.fillStyle = "#e0e7ff" // Light blue for hovered nodes
      } else {
        ctx.fillStyle = "#f1f5f9"
      }

      ctx.strokeStyle = isHovered ? "#4f46e5" : "#64748b"
      ctx.lineWidth = isHovered ? 2 : 1.5
      ctx.fill()
      ctx.stroke()

      // Draw a small dot in the center of the node
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2)
      if (isCurrentAnimationNode) {
        ctx.fillStyle = "white"
      } else if (isAnimating && isAnimatedNode) {
        ctx.fillStyle = "white"
      } else if (isPathNode && !isAnimating) {
        ctx.fillStyle = "white"
      } else {
        ctx.fillStyle = "#64748b"
      }
      ctx.fill()

      // Draw node label above the circle
      ctx.fillStyle = "#334155"
      ctx.font = isHovered ? "12px sans-serif" : "11px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"

      // Add background for text readability
      const textMetrics = ctx.measureText(node.id)
      const textWidth = textMetrics.width
      const textHeight = isHovered ? 14 : 12

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.fillRect(pos.x - textWidth / 2 - 2, pos.y - nodeRadius - textHeight - 2, textWidth + 4, textHeight + 2)

      ctx.fillStyle = "#334155"
      ctx.fillText(node.id, pos.x, pos.y - nodeRadius - 2)
    })
  }, [graph, localPositions, path, isWeighted, hoveredNode, animationStep, isAnimating])

  // Handle mouse events for dragging nodes and tooltips
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    // Check if a node was clicked
    for (const [nodeId, pos] of localPositions.entries()) {
      const dx = pos.x - x
      const dy = pos.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= 18) {
        // Slightly larger hit area
        setIsDragging(nodeId)
        break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    if (isDragging) {
      // Update node position
      const constrainedX = Math.max(20, Math.min(430, x))
      const constrainedY = Math.max(20, Math.min(380, y))

      const newPositions = new Map(localPositions)
      newPositions.set(isDragging, { x: constrainedX, y: constrainedY })
      setLocalPositions(newPositions)
      onPositionUpdate(newPositions)
    } else {
      // Check for hover
      let foundHover = false
      for (const [nodeId, pos] of localPositions.entries()) {
        const dx = pos.x - x
        const dy = pos.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= 18) {
          if (hoveredNode !== nodeId) {
            setHoveredNode(nodeId)

            // Get neighbors
            const neighbors = graph.getNeighbors(nodeId)
            const neighborList = neighbors ? Array.from(neighbors.keys()) : []

            setTooltip({
              nodeId,
              x: e.clientX,
              y: e.clientY,
              neighbors: neighborList,
              position: pos,
            })
          }
          foundHover = true
          break
        }
      }

      if (!foundHover && hoveredNode) {
        setHoveredNode(null)
        setTooltip(null)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  const handleMouseLeave = () => {
    setIsDragging(null)
    setHoveredNode(null)
    setTooltip(null)
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move rounded-lg"
        style={{ width: "100%", height: "100%" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 pointer-events-none transition-opacity duration-200"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{tooltip.nodeId}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div>
              <span className="font-medium">Position:</span> ({Math.round(tooltip.position.x)},{" "}
              {Math.round(tooltip.position.y)})
            </div>
            <div>
              <span className="font-medium">Neighbors:</span>{" "}
              {tooltip.neighbors.length > 0 ? tooltip.neighbors.join(", ") : "None"}
            </div>
            <div>
              <span className="font-medium">Connections:</span> {tooltip.neighbors.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
