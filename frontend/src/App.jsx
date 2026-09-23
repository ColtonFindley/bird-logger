import { useState } from "react"
import BirdList from "./components/BirdList"
import BirdForm from "./components/BirdForm"

function App() {
  // counter, start at 0
  const [refreshKey, setRefreshKey] = useState(0)

  // increment counter when a bird is created
  function handleBirdCreated() {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div>
      <h1>Bird Logger</h1>
      <BirdForm onBirdCreated={handleBirdCreated} />
       {/* when a new bird is created refreshKey updates, which causes BirdList to fetch again for an updated list */}
      <BirdList key={refreshKey} />
    </div>
  )
}

export default App