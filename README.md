# 🗺️ Route Planning System

A sophisticated web application for visualizing and analyzing graph-based route planning using advanced algorithms. Built with Next.js, React, and TypeScript, this interactive tool allows users to create custom city networks and find optimal paths between locations.

![Route Planning System](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

![image](https://github.com/user-attachments/assets/15bee1a2-ae72-4b27-a02a-18996ea4bd9a)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Graph Visualization** - Drag and drop nodes to create custom layouts
- **Multiple Algorithms** - Dijkstra's algorithm for weighted graphs, BFS for unweighted graphs
- **Real-time Path Finding** - Instantly calculate and visualize shortest paths
- **Weighted & Unweighted Graphs** - Support for both distance-based and hop-based routing

### 🎨 User Interface
- **Modern Design** - Clean, responsive interface with gradient backgrounds
- **Dark/Light Mode** - Toggle between themes with smooth transitions
- **Interactive Tooltips** - Hover over nodes to see coordinates, neighbors, and connections
- **Responsive Layout** - Optimized for desktop and mobile devices

### 🎬 Advanced Features
- **Step-by-Step Animation** - Watch algorithms traverse paths in real-time
- **Adjustable Animation Speed** - Control playback speed (Fast/Normal/Slow)
- **Visual Feedback** - Highlighted nodes and edges during path traversal
- **Animation Controls** - Play, pause, and stop path animations

### 💾 Data Management
- **Export/Import JSON** - Share graphs with precise node positions
- **Local Storage** - Automatic persistence of graph state
- **Manual Save** - Save button with success feedback
- **Default Cities** - Pre-loaded cities from Andhra Pradesh and Telangana

### 🔧 Technical Features
- **Exact Position Preservation** - Maintains precise node coordinates
- **Canvas-based Rendering** - Smooth graphics with HTML5 Canvas
- **Drag & Drop** - Intuitive node repositioning with boundary constraints
- **Real-time Updates** - Live graph updates as you modify the network

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/route-planning-system.git
   cd route-planning-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic Operations

#### Adding Cities
1. Navigate to the **Manage** tab
2. Enter a city name in the input field
3. Click **Add** or press **Enter**
4. The city appears on the graph canvas

#### Connecting Cities
1. Select source and target cities from the dropdowns
2. For weighted graphs, enter the distance
3. Click **Connect Cities**
4. A road appears between the selected cities

#### Finding Paths
1. Go to the **Find Path** tab
2. Select source and target cities
3. Choose your algorithm (Dijkstra's or BFS)
4. Click **Find Path**
5. The shortest path is highlighted on the graph

### Advanced Features

#### Animation Controls
- **Play Button** - Start step-by-step path animation
- **Speed Control** - Adjust animation speed (Fast/Normal/Slow)
- **Pause/Stop** - Control playback during animation

#### Data Export/Import
1. **Export**: Click the **Export** button to download graph as JSON
2. **Import**: Go to **Import** tab, paste JSON data, and click **Import**

#### Theme Toggle
- Click the sun/moon icon in the top-right corner to switch themes

## 🏗️ Architecture

### Project Structure
\`\`\`
route-planning-system/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── route-planner.tsx   # Main application component
│   ├── graph-visualizer.tsx # Canvas-based graph renderer
│   ├── theme-toggle.tsx    # Dark/light mode toggle
│   ├── theme-provider.tsx  # Theme context provider
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── graph.ts           # Graph data structure and algorithms
│   └── utils.ts           # Utility functions
└── hooks/
    └── use-window-size.ts  # Window size hook
\`\`\`

### Core Components

#### Graph Class (`lib/graph.ts`)
- **Data Structure**: Adjacency list representation
- **Algorithms**: Dijkstra's algorithm and BFS implementation
- **Operations**: Add/remove nodes and edges, pathfinding

#### GraphVisualizer (`components/graph-visualizer.tsx`)
- **Rendering**: HTML5 Canvas-based visualization
- **Interactions**: Mouse events for dragging and hovering
- **Animations**: Real-time path traversal visualization

#### RoutePlanner (`components/route-planner.tsx`)
- **State Management**: Graph state, UI state, and user interactions
- **Data Persistence**: Local storage and JSON export/import
- **User Interface**: Tabs, forms, and controls

## 🎨 Algorithms

### Dijkstra's Algorithm
- **Use Case**: Weighted graphs with distance-based routing
- **Time Complexity**: O((V + E) log V)
- **Features**: Finds shortest path by total distance

### Breadth-First Search (BFS)
- **Use Case**: Unweighted graphs with hop-based routing
- **Time Complexity**: O(V + E)
- **Features**: Finds path with minimum number of hops

## 🎯 Default Dataset

The application includes pre-configured cities from:
- **Telangana**: Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam
- **Andhra Pradesh**: Vijayawada, Visakhapatnam, Guntur, Tirupati, Nellore, and more

Cities are positioned geographically and connected with realistic distances.

## 🔧 Configuration

### Canvas Settings
- **Size**: 450x400 pixels (fixed for consistent positioning)
- **Boundaries**: Nodes constrained within canvas bounds
- **Precision**: Coordinates rounded to 2 decimal places

### Animation Settings
- **Speeds**: 500ms (Fast), 1000ms (Normal), 2000ms (Slow)
- **Visual Effects**: Color transitions and size scaling
- **Controls**: Play, pause, stop, and speed adjustment

### Theme Configuration
- **Default**: Light mode
- **Toggle**: Manual theme switching
- **Persistence**: Theme preference saved in browser

## 📊 Data Format

### Export JSON Structure
\`\`\`json
{
  "nodes": [
    { "id": "CityName" }
  ],
  "edges": [
    { "source": "City1", "target": "City2", "weight": 100 }
  ],
  "positions": [
    ["CityName", { "x": 225.00, "y": 120.00 }]
  ],
  "metadata": {
    "isWeighted": true,
    "algorithm": "dijkstra",
    "exportDate": "2024-01-15T10:30:00.000Z",
    "version": "1.0",
    "canvasSize": { "width": 450, "height": 400 }
  }
}
\`\`\`

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes

### Key Dependencies
\`\`\`json
{
  "next": "^15.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "next-themes": "^0.2.0",
  "lucide-react": "^0.263.0"
}
\`\`\`

### Build Commands
\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## 🎮 Interactive Features

### Mouse Interactions
- **Drag Nodes**: Click and drag to reposition cities
- **Hover Effects**: Node highlighting and tooltips
- **Boundary Constraints**: Nodes stay within canvas bounds

### Keyboard Shortcuts
- **Enter**: Add city when typing in the city name field
- **Tab**: Navigate between form fields

### Visual Feedback
- **Node States**: Default, hovered, path, current animation
- **Edge States**: Default, path, animated
- **Color Coding**: Different colors for different states

## 🔍 Troubleshooting

### Common Issues

#### Positions Not Saving
- Ensure you click the **Save Layout** button
- Check browser local storage permissions
- Verify the success checkmark appears

#### Import Fails
- Validate JSON format matches the expected structure
- Check that all required fields are present
- Ensure position coordinates are valid numbers

#### Animation Not Working
- Verify a valid path exists between selected cities
- Check that source and target cities are different
- Ensure the graph is connected

### Performance Tips
- Limit the number of nodes for optimal performance
- Use the save feature to preserve complex layouts
- Clear browser cache if experiencing issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful UI components
- **Lucide** for the comprehensive icon set
- **Next.js** team for the excellent framework
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include browser version and steps to reproduce

---

**Built with ❤️ using Next.js and modern web technologies**
