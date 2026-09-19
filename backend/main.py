from fastapi import FastAPI

from database import engine
import models

# create the tables defined in models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}