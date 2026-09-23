from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# all classes inherit BaseModel for input validation, parsing, and serialization

# validate fetched photo object, inside bird entry
class PhotoOut(BaseModel):
    # validate all Photo fields, except bird_id (redundant)
    id: int
    file_path: str
    uploaded_at: datetime

    # convert DB objects into API responses using attributes 
    class Config:
        from_attributes = True

# create a new bird entry from client
class BirdCreate(BaseModel):
    # fields client must/can set
    species: str # required
    common_name: str
    date_spotted: Optional[datetime] = None
    notes: Optional[str] = None
    # server handles fields not defined here

# edit existing bird entry from client
class BirdUpdate(BaseModel):
    # fields the client can update
    species: Optional[str] = None
    common_name: Optional[str] = None
    date_spotted: Optional[str] = None
    notes: Optional[str] = None

# validate fetched bird object
class BirdOut(BaseModel):
    # validate all Bird fields
    id: int
    species: str
    common_name: str
    date_spotted: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    photos: list[PhotoOut] = []

    # convert DB objects into API responses using attributes 
    class Config:
        from_attributes = True
