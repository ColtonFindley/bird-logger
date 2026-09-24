import { useState, useEffect } from "react"
import { listBirds, deleteBird, uploadPhoto, deletePhoto } from "../api"

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

    // handle deleting a bird entry
    async function handleDeleteBird(birdId) {
        // confirm if client wants to delete bird entry
        if (!window.confirm("Delete this bird entry and all its photos?")) return
        
        try {
            // call API
            await deleteBird(birdId)
            // update state by filtering out deleted bird
            setBirds((prev) => prev.filter((b) => b.id !== birdId))
        } catch (err) {
            setError(err.message)
        }
    }

    // handle adding a photo to a bird entry
    async function handleAddPhoto(birdId, file) {
        // guard against a null file
        if (!file) return

        try {
            const newPhoto = await uploadPhoto(birdId, file) // upload and receive new photo object
            // edit bird state
            setBirds((prev) =>
                // change bird list to include edited bird entry
                prev.map((bird) =>
                    // find matching bird, create new bird object with overriding photo array to include new photo
                    bird.id === birdId ? { ...bird, photos: [...bird.photos, newPhoto]} : bird
                )
            )
        } catch (err) {
            setError(err.message)
        }
    }

    // handle deleting a photo from a bird entry
    async function handleDeletePhoto(birdId, photoId) {
        try {
            // call API
            await deletePhoto(photoId)
            // edit bird state
            setBirds((prev) => 
                // change bird list to include entry without the photo
                prev.map((bird) =>
                    // find matching birdId, return a new photo array filted out with that photo
                    bird.id === birdId ? { ...bird, photos: bird.photos.filter((p) => p.id !== photoId)} : bird
                )
            )
        } catch (err) {
            setError(err.message)
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
                            <div>
                                {/* map and display all photos */}
                                {bird.photos.map((photo) => (
                                    <div key={photo.id} style={{ display: "inline-block", marginRight: "8px" }}>
                                        <img src={`/api/${photo.file_path}`} alt={bird.species} width={100} />
                                        <button onClick={() => handleDeletePhoto(bird.id, photo.id)}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* add photo button */}
                        <div>
                            <label>
                                Add photo:
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={(e) => handleAddPhoto(bird.id, e.target.files[0])}
                                />
                            </label>
                        </div>
                        {/* delete photo button */}
                        <button onClick={() => handleDeleteBird(bird.id)}>
                            Delete Entry
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default BirdList