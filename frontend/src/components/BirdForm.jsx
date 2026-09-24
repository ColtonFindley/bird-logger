import { useState } from "react"
import { createBird, uploadPhoto } from "../api"
import "./BirdForm.css"

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
        <form className="bird-form" onSubmit={handleSubmit}>
            <h2 className="bird-form__title">Log a New Bird</h2>

            {/* show error if there is one */}
            {error && <p className="bird-form__error">{error}</p>}

            <div className="bird-form__row">
                {/* set bird common name */}
                <label className="bird-form__field">
                    <span className="bird-form__label">Common name*</span>
                    <input
                        type="text"
                        value={commonName}
                        /* update state on every keystroke */
                        onChange={(event) => setCommonName(event.target.value)}
                    />
                </label>
                {/* set bird species */}
                <label className="bird-form__field">
                    <span className="bird-form__label">Species*</span>
                    <input
                        type="text"
                        value={species}
                        /* update state on every keystroke */
                        onChange={(event) => setSpecies(event.target.value)}
                    />
                </label>
            </div>

            {/* set date spotted */}
            <label className="bird-form__field">
                <span className="bird-form__label">Date spotted</span>
                <input
                    type="date"
                    value={dateSpotted}
                    /* update state on every keystroke */
                    onChange={(event) => setDateSpotted(event.target.value)}
                />
            </label>

            {/* set optional notes */}
            <label className="bird-form__field">
                <span className="bird-form__label">Notes</span>
                <textarea
                    rows={3}
                    value={notes}
                    /* update state on every keystroke */
                    onChange={(event) => setNotes(event.target.value)}
                />
            </label>

            {/* upload photo */}
            <label className="bird-form__upload">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="bird-form__upload-text">
                    {photoFile ? photoFile.name : "Choose a photo"}
                </span>
                <input
                    type="file"
                    /* show which file types are accepted */
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => setPhotoFile(event.target.files[0])}
                />
            </label>

            {/* submit button */}
            <button className="bird-form__submit" type="submit" disabled={submitting}>
                {/* display different message after submitting */}
                {submitting ? "Saving..." : "Add Bird"}
            </button>
        </form>
    )
}

export default BirdForm