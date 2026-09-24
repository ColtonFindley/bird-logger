import { useState } from "react"
import BirdList from "./components/BirdList"
import BirdForm from "./components/BirdForm"
import "./App.css"

function App() {
  // counter, start at 0
  const [refreshKey, setRefreshKey] = useState(0)

  // increment counter when a bird is created
  function handleBirdCreated() {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__icon" aria-hidden="true">🪶</span>
        <div>
          <h1 className="app__title">Bird Logger</h1>
          <p className="app__subtitle">Track the birds you've spotted and photographed</p>
        </div>
      </header>

      <BirdForm onBirdCreated={handleBirdCreated} />
      {/* when a new bird is created refreshKey updates, which causes BirdList to fetch again for an updated list */}
      <BirdList key={refreshKey} />
    </div>
  )
}

export default App