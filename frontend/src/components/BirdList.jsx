import { useState, useEffect } from "react"
import { listBirds, deleteBird, updateBird, uploadPhoto, deletePhoto } from "../api"

// list all birds
function BirdList() {
    const [birds, setBirds] = useState([]) // array of bird entries, updates on setBirds
    const [error, setError] = useState() // tracks errors
    const [loading, setLoading] = useState(true) // tracks if waiting, starts on true
    // editing
    const [editingId, setEditingId] = useState(null) // which bird is currently being edited
    const [editForm, setEditForm] = useState({species: "", common_name: "", date_spotted: "", notes: ""}) // in-progress edited values
    const [savingEdit, setSavingEdit] = useState(false) // 

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

    // start editing process
    function startEditing(bird) {
        // put bird into editing mode
        setEditingId(bird.id)
        // pre-fill the edit form with bird's current values
        setEditForm({
            species: bird.species,
            common_name: bird.common_name,
            date_spotted: bird.date_spotted || "", // optional
            notes: bird.notes || ""
        })
    }

    // if client cancels editing - swap to display view
    function cancelEditing() {
        setEditingId(null)
    }

    // save client edits
    async function saveEdit(birdId) {
        // if both species and common name is not entered
        if (!editForm.species.trim() && !editForm.common_name.trim()) {
            setError("Species and common name are required.")
            return
        }

        // if species is not entered
        if (!editForm.species.trim()) {
            setError("Species is required.")
            return
        }
        // if common name is not entered
        if (!editForm.common_name.trim()) {
            setError("Common name is required.")
            return
        } 
        // change saving edit state
        setSavingEdit(true)
        try {
            // all API with updates information
            const updated = await updateBird(birdId, {
                species: editForm.species.trim(),
                common_name: editForm.common_name.trim(),
                date_spotted: editForm.date_spotted.trim() || null, // optional
                notes: editForm.notes.trim() || null
            })
            // merge updated fields with matching bird
            setBirds((prev) =>
                prev.map((bird) => (bird.id === birdId ? { ...bird, ...updated}: bird))
            )
            // reset states
            setEditingId(null)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setSavingEdit(false)
        }
    }

    // display loading and error message
    if (loading) return <p>Loading birds...</p>
    // empty bird list edge case
    if (birds.length === 0) return <p>No birds logged yet.</p>

    return (
        <div>
            <h2>Logged Birds</h2>
            <ul>
                {/* loop through bird array */}
                {birds.map((bird) => (
                    <li key={bird.id}>
                        {/* display editing mode */}
                        {editingId === bird.id ? (
                            <div>
                                {/* if there is an error, display it above current bird */}
                                {error && <p style={{ color: "red" }}>{error}</p>}
                                <div>
                                    {/* update common name */}
                                    <label>
                                        Common name:
                                        <input
                                            type="text"
                                            value={editForm.common_name}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, common_name: e.target.value }))
                                            }
                                        />
                                    </label>
                                </div>
                                <div>
                                    {/* update species */}
                                    <label>
                                        Species*:
                                        <input
                                            type="text"
                                            value={editForm.species}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, species: e.target.value }))
                                            }
                                        />
                                    </label>
                                </div>
                                <div>
                                    {/* update date spotted */}
                                    <label>
                                        Date spotted:
                                        <input
                                            type="date"
                                            value={editForm.date_spotted}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, date_spotted: e.target.value }))
                                            }
                                        />
                                    </label>
                                </div>
                                <div>
                                    {/* update notes */}
                                    <label>
                                        Notes:
                                        <textarea
                                            value={editForm.notes}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                                            }
                                        />
                                    </label>
                                </div>
                                <button onClick={() => saveEdit(bird.id)} disabled={savingEdit}>
                                    {savingEdit ? "Saving..." : "Save"}
                                </button>
                                <button onClick={cancelEditing} disabled={savingEdit}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div>
                                <strong>{bird.common_name}</strong>
                                {/* only show notes and date spotted if they exist */}
                                {` (${bird.species})`}
                                {bird.notes && <p>{bird.notes}</p>}
                                {bird.date_spotted && <p>{bird.date_spotted}</p>}
                                <button onClick={() => startEditing(bird)}>Edit</button>
                            </div>
                        )}

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
                        {/* delete entry button */}
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