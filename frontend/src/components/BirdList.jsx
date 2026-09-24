import { useState, useEffect } from "react"
import { listBirds, deleteBird, updateBird, uploadPhoto, deletePhoto } from "../api"
import BirdCard from "./BirdCard"
import "./BirdList.css"

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
        <section className="bird-list">
            <h2 className="bird-list__title">
                Logged Birds <span className="bird-list__count">{birds.length}</span>
            </h2>
            {birds.length === 0 ? (
                /* when there are no birds logged */
                <p className="bird-list__empty">No birds logged yet.</p>
            ) : (
                /* when there are birds logged */
                <ul className="bird-list__items">
                    {/* loop through bird array */}
                    {birds.map((bird) => (
                        <BirdCard
                            key={bird.id}
                            bird={bird}
                            isEditing={editingId === bird.id}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            error={error}
                            savingEdit={savingEdit}
                            startEditing={startEditing}
                            saveEdit={saveEdit}
                            cancelEditing={cancelEditing}
                            handleAddPhoto={handleAddPhoto}
                            handleDeletePhoto={handleDeletePhoto}
                            handleDeleteBird={handleDeleteBird}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default BirdList