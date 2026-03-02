from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from pydantic import BaseModel

app = FastAPI(title="SAF AI Predictor")

# CORS (VERY IMPORTANT for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("saf_model.pkl")

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