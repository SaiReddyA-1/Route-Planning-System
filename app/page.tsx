import RoutePlanner from "@/components/route-planner"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            Route Planning System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover optimal routes between cities using advanced graph algorithms. Add cities, connect them with roads,
            and find the shortest path between any two locations.
          </p>
        </div>
        <RoutePlanner />
      </div>
    </main>
  )
}
