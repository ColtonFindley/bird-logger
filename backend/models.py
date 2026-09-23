from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base

# id | species | common_name | date_spotted | notes | created_at | updated_at
class Bird(Base):
    __tablename__ = "birds"
    # primary key, indexed
    id = Column(Integer, primary_key = True, index= True)
    species = Column(String, nullable = False)
    common_name = Column(String, nullable = False)
    date_spotted = Column(String, nullable = True)
    notes = Column(String, nullable = True)
    # set to current time when row is created, db will fill this in 
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    # update to current time when row is modified
    updated_at = Column(DateTime(timezone = True), onupdate=func.now())

    # corresponds a list of photo objects to a bird entry
    photos = relationship("Photo", back_populates="bird", cascade="all, delete-orphan")

# id | bird_id | file_path | uploaded_at
class Photo(Base):
    __tablename__ = "photos"
    # primary key
    id = Column(Integer, primary_key = True, index = True)
    # foreign key
    bird_id = Column(Integer, ForeignKey("birds.id"), nullable = False)
    file_path = Column(String, nullable = False)
    # db will fill this in when the photo was added
    uploaded_at = Column(DateTime(timezone = True), server_default=func.now())

    # correspond the parent bird from a photo object
    bird = relationship("Bird", back_populates = "photos")