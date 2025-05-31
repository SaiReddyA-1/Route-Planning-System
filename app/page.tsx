import RoutePlanner from "@/components/route-planner"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Route Planning System</h1>
        <p className="text-gray-600 mb-8">
          Add cities, connect them with roads, and find the shortest path between locations.
        </p>
        <RoutePlanner />
      </div>
    </main>
  )
}
