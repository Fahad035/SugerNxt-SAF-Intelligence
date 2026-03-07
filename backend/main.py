from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import joblib
import numpy as np
from pydantic import BaseModel
import os
from pathlib import Path
import base64
import hashlib
import hmac
import json
import re
import sqlite3
import time

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

DB_PATH = Path(__file__).resolve().parent / "users.db"
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret-in-production")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "10080"))  # 7 days
PBKDF2_ITERATIONS = 120000
security = HTTPBearer(auto_error=False)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_auth_db():
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                company TEXT,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
            """
        )
        connection.commit()


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def create_password_hash(password: str, salt: bytes) -> str:
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return _b64url_encode(digest)


def verify_password(password: str, stored_hash: str, stored_salt: str) -> bool:
    salt = _b64url_decode(stored_salt)
    candidate = create_password_hash(password, salt)
    return hmac.compare_digest(candidate, stored_hash)


def create_jwt_token(subject: str, expires_minutes: int = JWT_EXP_MINUTES) -> str:
    now = int(time.time())
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + expires_minutes * 60,
    }
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_and_validate_jwt(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")

    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    provided_signature = _b64url_decode(signature_b64)

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature")

    payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    if not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    return payload

class InputData(BaseModel):
    molasses_ton: float
    fermentation_eff: float
    dehydration_eff: float
    atj_eff: float
    energy_input: float
    ethanol_liters: float


class SignupInput(BaseModel):
    full_name: str
    company: str | None = ""
    email: str
    password: str


class LoginInput(BaseModel):
    email: str
    password: str


class AuthUser(BaseModel):
    email: str
    full_name: str
    company: str | None = ""


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: AuthUser


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    payload = decode_and_validate_jwt(credentials.credentials)
    email = payload["sub"].strip().lower()

    with get_db_connection() as connection:
        user = connection.execute(
            "SELECT email, full_name, company FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {
        "email": user["email"],
        "full_name": user["full_name"],
        "company": user["company"] or "",
    }

@app.get("/")
def home():
    return {"message": "Backend running"}


@app.post("/auth/signup", response_model=AuthResponse)
def auth_signup(data: SignupInput):
    email = str(data.email).strip().lower()
    full_name = data.full_name.strip()
    company = (data.company or "").strip()

    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")
    if len(full_name) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Full name is too short")
    if len(data.password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    salt = os.urandom(16)
    password_hash = create_password_hash(data.password, salt)

    try:
        with get_db_connection() as connection:
            connection.execute(
                """
                INSERT INTO users (email, full_name, company, password_hash, salt, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    email,
                    full_name,
                    company,
                    password_hash,
                    _b64url_encode(salt),
                    int(time.time()),
                ),
            )
            connection.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    token = create_jwt_token(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_EXP_MINUTES * 60,
        "user": {
            "email": email,
            "full_name": full_name,
            "company": company,
        },
    }


@app.post("/auth/login", response_model=AuthResponse)
def auth_login(data: LoginInput):
    email = str(data.email).strip().lower()

    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")

    with get_db_connection() as connection:
        user = connection.execute(
            "SELECT email, full_name, company, password_hash, salt FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not user or not verify_password(data.password, user["password_hash"], user["salt"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_jwt_token(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_EXP_MINUTES * 60,
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "company": user["company"] or "",
        },
    }


@app.get("/auth/me", response_model=AuthUser)
def auth_me(current_user: dict = Depends(get_current_user)):
    return current_user

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


init_auth_db()