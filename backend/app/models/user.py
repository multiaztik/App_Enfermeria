"""
Modelos Pydantic para Usuarios (Enfermeros)
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str = Field(..., description="Correo electrónico institucional")
    password: str = Field(..., min_length=6, description="Contraseña")
    nombre: str = Field(..., description="Nombre completo")
    cedula: str = Field(..., description="Cédula profesional")
    role: str = Field(default="nurse", pattern="^(nurse|student|admin)$")


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    nombre: str
    role: str
    cedula: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
