"""
Rutas de Autenticación con MongoDB
Login, Register, y validación de tokens
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.database import get_users_collection

router = APIRouter()


def user_doc_to_response(doc: dict) -> UserResponse:
    """Convierte documento MongoDB a UserResponse"""
    return UserResponse(
        id=str(doc["_id"]),
        email=doc["email"],
        nombre=doc["nombre"],
        role=doc["role"],
        cedula=doc["cedula"],
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Registrar un nuevo usuario (enfermero/estudiante)"""
    users = get_users_collection()

    # Verificar email único
    existing = await users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado",
        )

    now = datetime.now(timezone.utc)
    doc = {
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "nombre": user_data.nombre,
        "role": user_data.role,
        "cedula": user_data.cedula,
        "created_at": now,
        "updated_at": now,
    }

    result = await users.insert_one(doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": user_data.email})

    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        nombre=user_data.nombre,
        role=user_data.role,
        cedula=user_data.cedula,
        created_at=now,
    )

    return TokenResponse(access_token=token, user=user_response)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Iniciar sesión con email y contraseña"""
    users = get_users_collection()

    user = await users.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"]})

    return TokenResponse(
        access_token=token,
        user=user_doc_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Obtener perfil del usuario autenticado"""
    users = get_users_collection()

    try:
        user = await users.find_one({"_id": ObjectId(current_user["user_id"])})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID inválido")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return user_doc_to_response(user)
