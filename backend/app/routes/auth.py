"""
Rutas de Autenticación
Login, Register, y validación de tokens
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()

# Almacén temporal en memoria (reemplazar con MongoDB en producción)
users_db: dict[str, dict] = {}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Registrar un nuevo usuario (enfermero/estudiante)"""
    if user_data.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado",
        )
    
    user_id = f"user-{len(users_db) + 1}"
    hashed_pw = hash_password(user_data.password)
    
    users_db[user_data.email] = {
        "id": user_id,
        "email": user_data.email,
        "hashed_password": hashed_pw,
        "nombre": user_data.nombre,
        "role": user_data.role,
        "cedula": user_data.cedula,
        "created_at": datetime.now(timezone.utc),
    }
    
    token = create_access_token({"sub": user_id, "email": user_data.email})
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        nombre=user_data.nombre,
        role=user_data.role,
        cedula=user_data.cedula,
        created_at=users_db[user_data.email]["created_at"],
    )
    
    return TokenResponse(access_token=token, user=user_response)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Iniciar sesión con email y contraseña"""
    user = users_db.get(credentials.email)
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )
    
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        nombre=user["nombre"],
        role=user["role"],
        cedula=user["cedula"],
        created_at=user["created_at"],
    )
    
    return TokenResponse(access_token=token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Obtener perfil del usuario autenticado"""
    # Buscar usuario por ID
    for user_data in users_db.values():
        if user_data["id"] == current_user["user_id"]:
            return UserResponse(
                id=user_data["id"],
                email=user_data["email"],
                nombre=user_data["nombre"],
                role=user_data["role"],
                cedula=user_data["cedula"],
                created_at=user_data["created_at"],
            )
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuario no encontrado",
    )
