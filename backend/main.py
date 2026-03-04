from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from pydantic import BaseModel
import os
from pathlib import Path

app = FastAPI(title="SAF AI Predictor")

# CORS
# - ALLOWED_ORIGINS: comma-separated list, e.g. https://my-app.vercel.app,http://localhost:5173
# - ALLOWED_ORIGIN_REGEX: optional regex for preview domains, default allows *.vercel.app
raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    origin.strip().rstrip("/")
    for origin in raw_allowed_origins.split(",")
    if origin.strip()
]

if not origins:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

has_wildcard = "*" in origins
allow_origin_regex = None if has_wildcard else os.getenv("ALLOWED_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=not has_wildcard,
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