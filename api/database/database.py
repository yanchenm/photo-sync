import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

load_dotenv()

dev_url = f"postgresql://{os.environ['DEV_DB_USER']}:{os.environ['DEV_DB_PASSWORD']}@localhost/photo_sync"
prod_url = f"cockroachdb://{os.environ['PROD_DB_USER']}:{os.environ['PROD_DB_PASSWORD']}" +\
           "@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/photo_sync?sslmode=verify-full&" +\
           f"sslrootcert={os.environ['PROD_DB_CERT_DIR']}&options=--cluster=photo-sync-946"

SQLALCHEMY_DATABASE_URL = prod_url if os.getenv("ENVIRONMENT") == "PROD" else dev_url

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
