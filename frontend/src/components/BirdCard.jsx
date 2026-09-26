import { useState, useEffect } from "react"
import "./BirdCard.css"

// Parse "YYYY-MM-DD" as a local date
function formatDate(value) {
    if (!value) return null
    const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return value
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export default function BirdCard({
    bird,
    isEditing,
    editForm,
    setEditForm,
    error,
    savingEdit,
    startEditing,
    saveEdit,
    cancelEditing,
    handleAddPhoto,
    handleDeletePhoto,
    handleDeleteBird,
}) {
    const [open, setOpen] = useState(false) // open card state
    const expanded = open || isEditing // if card is expanded
    const photoCount = bird.photos.length // number of photos
    const [lightboxPhoto, setLightboxPhoto] = useState(null) // currently enlarged photo
    const bodyId = `bird-body-${bird.id}`

    const updateField = (field) => (e) =>
        setEditForm((prev) => ({ ...prev, [field]: e.target.value }))

    // close the lightbox on Escape
    useEffect(() => {
        if (!lightboxPhoto) return
        function onKeyDown(e) {
            if (e.key === "Escape") setLightboxPhoto(null)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [lightboxPhoto])

    return (
        <li className={`bird-card ${expanded ? "is-open" : ""}`}>
            {/* display editing mode */}
            {isEditing ? (
                <div className="bird-card__edit">
                    {/* if there is an error, display it above current bird */}
                    {error && <p className="bird-card__error">{error}</p>}

                    <div className="field-row">
                        {/* display common name */}
                        <label className="field">
                            <span className="field__label">Common name*</span>
                            <input
                                type="text"
                                value={editForm.common_name}
                                onChange={updateField("common_name")}
                            />
                        </label>
                        {/* display species */}
                        <label className="field">
                            <span className="field__label">Species*</span>
                            <input
                                type="text"
                                value={editForm.species}
                                onChange={updateField("species")}
                            />
                        </label>
                    </div>
                    {/* display date spotted */}
                    <label className="field">
                        <span className="field__label">Date spotted</span>
                        <input
                            type="date"
                            value={editForm.date_spotted}
                            onChange={updateField("date_spotted")}
                        />
                    </label>
                    {/* display notes*/}
                    <label className="field">
                        <span className="field__label">Notes</span>
                        <textarea
                            rows={3}
                            value={editForm.notes}
                            onChange={updateField("notes")}
                        />
                    </label>
                    {/* actions to do in the bird card */}
                    <div className="bird-card__actions">
                        <button
                            className="btn btn--primary"
                            onClick={() => saveEdit(bird.id)}
                            disabled={savingEdit}
                        >
                            {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                            className="btn btn--ghost"
                            onClick={cancelEditing}
                            disabled={savingEdit}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* display mode */
                <button
                    type="button"
                    className="bird-card__header"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={expanded}
                    aria-controls={bodyId}
                >
                    <div className="bird-card__title">
                        <strong className="bird-card__name">{bird.common_name}</strong>
                        <span className="bird-card__species">{bird.species}</span>
                    </div>
                    <div className="bird-card__meta">
                        {bird.date_spotted && (
                            <span className="chip">{formatDate(bird.date_spotted)}</span>
                        )}
                        <span className="chip chip--accent">
                            {photoCount} {photoCount === 1 ? "photo" : "photos"}
                        </span>
                        <svg
                            className="bird-card__chevron"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </button>
            )}

            {/* collapsible body */}
            <div id={bodyId} className="bird-card__collapse">
                <div className="bird-card__collapse-inner">
                    <div className="bird-card__body">
                        {/* only show notes if they exist (hidden while editing) */}
                        {!isEditing && bird.notes && (
                            <p className="bird-card__notes">{bird.notes}</p>
                        )}

                        {/* display photo(s) if there are any */}
                        {photoCount > 0 ? (
                            <div className="photo-grid">
                                {/* map and display all photos */}
                                {bird.photos.map((photo) => (
                                    <figure key={photo.id} className="photo">
                                        {/* clicking the photo enlarges it */}
                                        <button
                                            type="button"
                                            className="photo__zoom"
                                            onClick={() => setLightboxPhoto(photo)}
                                            aria-label="Enlarge photo"
                                        >
                                            <img
                                                src={`/api/${photo.file_path}`}
                                                alt={bird.species}
                                                loading="lazy"
                                            />
                                        </button>
                                        <button
                                            className="photo__remove"
                                            onClick={() => handleDeletePhoto(bird.id, photo.id)}
                                            aria-label="Remove photo"
                                        >
                                            Remove
                                        </button>
                                    </figure>
                                ))}
                            </div>
                        ) : (
                            <p className="bird-card__empty">No photos yet.</p>
                        )}

                        <div className="bird-card__footer">
                            <div className="bird-card__actions">
                                {/* add photo button */}
                                <label className="btn btn--soft file-btn">
                                    + Add photo
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={(e) => handleAddPhoto(bird.id, e.target.files[0])}
                                    />
                                </label>
                                {!isEditing && (
                                    <button
                                        className="btn btn--ghost"
                                        onClick={() => startEditing(bird)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {/* delete entry button */}
                            <button
                                className="btn btn--danger"
                                onClick={() => handleDeleteBird(bird.id)}
                            >
                                Delete Entry
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* lightbox overlay, only rendered when a photo is selected */}
            {lightboxPhoto && (
                <div
                    className="lightbox"
                    onClick={() => setLightboxPhoto(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Enlarged photo of ${bird.species}`}
                >
                    <button
                        className="lightbox__close"
                        onClick={() => setLightboxPhoto(null)}
                        aria-label="Close"
                    >
                        x
                    </button>
                    <img
                        src={`/api/${lightboxPhoto.file_path}`}
                        alt={bird.species}
                        className="lightbox__img"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </li>
    );
}