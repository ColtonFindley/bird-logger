from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import engine, get_db
import models
import schemas

# create the tables defined in models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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