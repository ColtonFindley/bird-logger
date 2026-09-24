# Bird logging app
Web app to log photographed birds. When a new bird is photographed, add a new entry to the log with the picture. When more photos are added, edit the entry to include the additional photos.

## Tech
Frontend: React

Backend: Python - FastAPI

Database: SQLite

## Database model
birds table:

id | species | common_name | date_spotted | notes | created_at | updated_at

photos table:

id | bird_id (foreign key to birds.id) | file_path | uploaded_at

## API endpoints
Birds:
- List entries: GET /birds
- Create entry: POST /birds
- Get entry: GET /birds/{id}
- Edit entry: PUT/PATCH /birds/{id}
- Delete entry: DELETE /birds/{id}

Photos:
- Add photo to entry: POST /birds/{id}/photos
- Delete photo: DELETE /photos/{id}

## Structure
```
bird-logger/
    backend/
        main.py # FastAPI app and routes
        models.py # SQLAlchemy models
        database.py # DB connection/session setup
        schemas.py # Pydantic request/response models
        uploads/ # Photos
        requirements.txt
    frontend/
        src/
            App.jsx # React app
            App.css
            main.jsx
            index.css
            components/
                BirdForm.jsx # Form to add a new bird entry
                BirdList.jsx
                BirdList.css
                BirdCard.jsx
                BirdCard.css
            api.js # Fetch calls
        package.json
```

## Setup