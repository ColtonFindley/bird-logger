import { useState, useEffect } from "react"
import { listBirds } from "../api"

// list all birds
function BirdList() {
    const [birds, setBirds] = useState([]) // array of bird entries, updates on setBirds
    const [error, setError] = useState() // tracks errors
    const [loading, setLoading] = useState(true) // tracks if waiting, starts on true

    // load birds when component first renders, only once
    useEffect(() => {
        loadBirds()
    }, [])

    // load bird entries
    async function loadBirds() {
        // catch any thrown error
        try {
            // set loading state
            setLoading(true)
            const data = await listBirds() // calls api function for bird array
            // change state
            setBirds(data)
            // clear any previous errors
            setError(null)
        // if an error is thrown
        } catch (err) {
            setError(err.message)
        // end with always setting loading to false
        } finally {
            setLoading(false)
        }
    }

    // display loading and error message
    if (loading) return <p>Loading birds...</p>
    if (error) return <p>Error: {error}</p>
    // empty bird list edge case
    if (birds.length === 0) return <p>No birds logged yet.</p>

    return (
        <div>
            <h2>Logged Birds</h2>
            <ul>
                {/* loop through bird array */}
                {birds.map((bird) => (
                    <li key={bird.id}>
                        <strong>{bird.common_name}</strong>
                        {/* only show notes and date spotted if they exist */}
                        {` (${bird.species})`}
                        {bird.notes && <p>{bird.notes}</p>}
                        {bird.date_spotted && <p>{bird.date_spotted}</p>}
                        {/* display photo(s) if there are any */}
                        {bird.photos.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {bird.photos.map((photo) => (
                                <img
                                    key={photo.id}
                                    src={`/api/${photo.file_path}`}
                                    alt={bird.species}
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                                ))}
                        </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default BirdList