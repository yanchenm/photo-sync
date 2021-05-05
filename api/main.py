from fastapi import FastAPI

from routers import users, auth, photos

app = FastAPI()
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(photos.router)
