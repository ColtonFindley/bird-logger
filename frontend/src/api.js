const BASE_URL = "/api"

// create a bird entry
export async function createBird(bird) {
    // send a HTTP POST
    const response = await fetch('${BASE_URL}/birds', {
        method : "POST",
        // backend will expect JSON
        headers: { "Content-Type": "application/json"},
        // converts to a JSON string for the request body
        body: JSON.stringify(bird)
    })
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to create bird")
    }
    return response.json()
}

// list all bird entries
export async function listBirds() {
    // await pauses function until response is received
    const response = await fetch('${BASE_URL}/birds') // send HTTP GET
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to fetch birds")
    }
    return response.json()
}

// list a single bird entry by id
export async function getBird(id) {
    const response = await fetch('${BASE_URL}/birds/${id}') // send HTTP GET
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to fetch bird")
    }
    return response.json()
}

// update a bird entry by id and updates
export async function updateBird(id, updates) {
    // send HTTP PATCH
    const response = await fetch('${BASE_URL}/birds/${id}', {
        method: "PATCH",
        headers: { "Content-Type": "applicatoin/json" },
        body: JSON.stringify(updates)
    })
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to update bird")
    }
    return response.json()
}

// delete a bird entry by id
export async function deleteBird(id) {
    // send HTTP DELETE
    const response = await fetch('${BASE_URL}/birds/${id}', {
        method: "DELETE"
    })
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to delete bird")
    }
    return response.json()
}

// upload a photo to a bird entry
export async function uploadPhoto(birdId, file) {
    const formData = new FormData() // new FormData object
    // add file under the key "file" (matches parameter name in main.py)
    formData.append("file", file)

    // send HTTP POST
    const response = await fetch('${BASE_URL}/birds/${birdId}/photos', {
        methods: "POST",
        body: formData
    })
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to upload photo")
    }
    return response.json()
}

// delete a photo by photoId
export async function deletePhoto(photoId) {
    // send HTTP DELETE
    const response = await fetch('${BASE_URL}/photos/${photoId}', {
        method: "DELETE"
    })
    // if response does not have status codes 200-299
    if (!response.ok) {
        throw new Error("Failed to delete photo")
    }
    return response.json()
}