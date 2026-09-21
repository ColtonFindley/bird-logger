from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite, db file birds.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./birds.db" # connection string

# new engine instance, connects to the database
engine = create_engine(
    # allow SQLite to handle requests on different threads
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# create a factory for session objects, turn autocommit and autoflush off
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind=engine)

# bridge Python classes and SQL tables
# Python classes that inherit Base will be recognized as a mapped table
Base = declarative_base() # create Base class

# new db session to each request
def get_db():
    # open new session
    db = SessionLocal()
    try:
        # give session to whatever endpoint requested it
        yield db
    # always close session
    finally:
        db.close()