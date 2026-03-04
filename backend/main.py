from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from pydantic import BaseModel
import os
from pathlib import Path

app = FastAPI(title="SAF AI Predictor")

# CORS (set ALLOWED_ORIGINS on Render, comma-separated)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model_path = Path(__file__).resolve().parent / "saf_model.pkl"
model = joblib.load(model_path)

class InputData(BaseModel):
    molasses_ton: float
    fermentation_eff: float
    dehydration_eff: float
    atj_eff: float
    energy_input: float
    ethanol_liters: float

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/predict")
def predict(data: InputData):
    features = np.array([[
        data.molasses_ton,
        data.fermentation_eff,
        data.dehydration_eff,
        data.atj_eff,
        data.energy_input,
        data.ethanol_liters
    ]])

    prediction = model.predict(features)[0]

    return {"predicted_saf": float(prediction)}