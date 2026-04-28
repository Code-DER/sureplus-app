from fastapi import FastAPI, HTTPException
from database import supabase

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}

@app.get("/users")
async def get_users():
    response = supabase.table("User").select("*").execute()

    return response.data