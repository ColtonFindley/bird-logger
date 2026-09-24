import { useState } from "react"
import { createBird, uploadPhoto } from "../api"

// form to create bird entry
function BirdForm({onBirdCreated}) {
    const [species, setSpecies] = useState("") // bird species
    const [commonName, setCommonName] = useState("") // bird common name
    const [dateSpotted, setDateSpotted] = useState("") // date bird spotted
    const [notes, setNotes] = useState("") // notes on entry
    const [photoFile, setPhotoFile] = useState(null) // submitted photo file
    const [submitting, setSubmitting] = useState(false) // track if submission in progress
    const [error, setError] = useState(null) // holds validation or API error message

    // when form is submitted
    async function handleSubmit(event) {
        // stop browser from reloading on submit
        event.preventDefault()
        setError(null)

        // if both species and common name is not entered
        if (!species.trim() && !commonName.trim()) {
            setError("Species and common name are required.")
            return
        }

        // if species is not entered
        if (!species.trim()) {
            setError("Species is required.")
            return
        }
        // if common name is not entered
        if (!commonName.trim()) {
            setError("Common name is required.")
            return
        } 
        // start submission - disable button and show message
        setSubmitting(true)
        // try block to catch errors
        try {
            // create new bird
            const newBird = await createBird({
                species: species.trim(),
                common_name: commonName.trim(),
                date_spotted: dateSpotted || null, // optional
                notes: notes.trim() || null
            })
            
            // upload photo only if user selected one
            if (photoFile) {
                await uploadPhoto(newBird.id, photoFile)
            }

            // clear form for next entry
            setSpecies("")
            setCommonName("")
            setDateSpotted("")
            setNotes("")
            setPhotoFile(null)
            // reset file input
            event.target.reset()

            // function passed in, will refresh bird list
            onBirdCreated()
        // if an error is thrown
        } catch (err) {
            setError(err.message)
        // re-enable button
        } finally {
            setSubmitting(false)
        }
    }

    return (
        // on submission call defined function
        <form onSubmit={handleSubmit}>
            <h2>Log a New Bird</h2>

            {/* show error if there is one */}
            {error && <p style={{color: "red"}}>{error}</p>}
            {/* set bird common name */}
            <div>
                <label>
                    Common name*:
                    <input 
                        type="text" 
                        value={commonName}
                        /* update state on every keystoke */
                        onChange={(event) => setCommonName(event.target.value)}
                    />
                </label>
            </div>
            {/* set bird species */}
            <div>
                <label>
                    Species*:
                    <input 
                        type="text" 
                        value={species}
                        /* update state on every keystoke */
                        onChange={(event) => setSpecies(event.target.value)}
                    />
                </label>
            </div>
            {/* set date spotted */}
            <div>
                <label>
                    Date spotted:
                    <input 
                        type="date" 
                        value={dateSpotted}
                        /* update state on every keystoke */
                        onChange={(event) => setDateSpotted(event.target.value)}
                    />
                </label>
            </div>
            {/* set optional notes */}
            <div>
                <label>
                    Notes:
                    <textarea 
                        value={notes}
                        /* update state on every keystoke */
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </label>
            </div>
            {/* upload photo */}
            <div>
                <label>
                    Photo:
                    <input 
                        type="file" 
                        /* show which file types are accepted */
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        /* update state on every keystoke */
                        onChange={(event) => setPhotoFile(event.target.files[0])}
                    />
                </label>
            </div>
            {/* submit button */}
            <button type="submit" disabled={submitting}>
                {/* display different message after submitting */}
                {submitting ? "Saving..." : "Add Bird"}
            </button>
        </form>
    )
}

export default BirdForm