from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict, Any
import firebase_admin
from firebase_admin import firestore
from contextlib import asynccontextmanager

class Data(BaseModel):
    name: str
    data: Dict[str, Any]

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    yield firestore.client()
    Request.app.state.db = firestore.client()

app = FastAPI(title="SpectraDerma Web Receiver",
              description="This is the BLE Web Receiver",
              version="0.1.0",
              lifespan=lifespan
    )


@app.get("/")
async def root():
    """Root message"""
    return {"message": "Hello World"}


@app.post("/create/data")
async def create_data(data: BaseModel):
    """upload the data to firebase"""
    return {"message": "post"}
