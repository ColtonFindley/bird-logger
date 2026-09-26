from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, get_db
import models
import schemas

import os
import shutil
import uuid

# create the tables defined in models
models.Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "uploads" # folder where photos are saved
# create photo file, won't raise error if it already exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
# mount uploads folder as static
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def health_check():
    return {"status": "ok"}

# decorator, registers create_bird as the function to run with a POST request to /brids, format output to BirdOut schema
@app.post("/birds", response_model = schemas.BirdOut)
# create a new bird entry with BirdCreate schema along with new db session
def create_bird(bird: schemas.BirdCreate, db: Session = Depends(get_db)):
    db_bird = models.Bird(**bird.model_dump()) # convert Pydantic object into a dict and unpack it
    # stage new row in db
    db.add(db_bird)
    # save new row in db
    db.commit()
    db.refresh(db_bird)
    return db_bird

@app.get("/birds", response_model = list[schemas.BirdOut])
# return all Bird entries in the database
def list_brids(db: Session = Depends(get_db)):
    return db.query(models.Bird).all()

# {bird_id} becomes the function paramater bird_id
@app.get("/birds/{bird_id}", response_model = schemas.BirdOut)
# return a specific Bird
def get_bird(bird_id: int, db: Session = Depends(get_db)):
    # query database to find matching bird_id entry
    bird = db.query(models.Bird).filter(models.Bird.id == bird_id).first()
    # if queried bird_id does not exist in database
    if not bird:
        # raise 404 error
        raise HTTPException(status_code=404, detail="Bird not found")
    # if bird_id does exist in database
    return bird

@app.patch("/birds/{bird_id}", response_model = schemas.BirdOut)
# edit an existing Bird entry
def update_bird(bird_id: int, updates: schemas.BirdUpdate, db: Session = Depends(get_db)):
    # query database to find matching bird_id entry
    bird = db.query(models.Bird).filter(models.Bird.id == bird_id).first()
    # if queried bird_id does not exist in database
    if not bird:
        # raise 404 error
        raise HTTPException(status_code=404, detail="Bird not found")
    # loop through all fields sent by client, excluding unsent ones
    for field, value in updates.model_dump(exclude_unset=True).items():
        # set bird.field = value
        setattr(bird, field, value)
    # save updates to entry
    db.commit()
    db.refresh(bird)
    return bird

@app.delete("/birds/{bird_id}")
def delete_bird(bird_id: int, db: Session = Depends(get_db)):
    # query database to find matching bird_id entry
    bird = db.query(models.Bird).filter(models.Bird.id == bird_id).first()
    # if queried bird_id does not exist in database
    if not bird:
        # raise 404 error
        raise HTTPException(status_code=404, detail="Bird not found")
    # delete bird entry and save changes
    # photos under bird entry will be deleted too, due to the cascade set on photo relationships
    db.delete(bird)
    db.commit()
    return {"detail": "Bird deleted"}

# allowed content types and extensions with photo uploads
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@app.post("/birds/{bird_id}/photos", response_model = schemas.PhotoOut)
# upload a photo to an existing bird entry
# File(...) specifies a file is required with no default value
def upload_photo(bird_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # query database to find matching bird_id entry
    bird = db.query(models.Bird).filter(models.Bird.id == bird_id).first()
    # if queried bird_id does not exist in database
    if not bird:
        # raise 404 error
        raise HTTPException(status_code=404, detail="Bird not found")
    # make the full path of the inputted file
    file_extension = os.path.splitext(file.filename)[1].lower() # file extension of inputted file

    # check if content type/extension if valid
    if file.content_type not in ALLOWED_CONTENT_TYPES or file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed types: jpg, jpeg, png, webp, gif")

    unique_filename = f"{uuid.uuid4()}{file_extension}" # generate unique filename
    file_path = os.path.join(UPLOAD_DIR, unique_filename) # build full path

    # open new file in wb mode
    with open(file_path, "wb") as buffer:
        # copy the uploaded file to the newly created file in the server, buffer
        shutil.copyfileobj(file.file, buffer)
    # create db row 
    db_photo = models.Photo(bird_id = bird_id, file_path = file_path)
    # add row to database
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.delete("/photos/{photo_id}")
# delete a photo
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    # query database to find matching photo_id entry
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    # if queried photo_id does not exist in database
    if not photo:
        # raise 404 error
        raise HTTPException(status_code=404, detail="Photo not found")
    # check if photo exists on disk
    if os.path.exists(photo.file_path):
        # delete file from disk
        os.remove(photo.file_path)
    # remove photo from db
    db.delete(photo)
    db.commit()
    return {"detail": "Photo deleted"}