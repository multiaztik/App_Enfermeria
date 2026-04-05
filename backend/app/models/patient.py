"""
Modelos Pydantic para Pacientes
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PersonalData(BaseModel):
    nombre: str = Field(..., description="Nombre completo del paciente")
    edad: int = Field(..., ge=0, le=150, description="Edad del paciente")
    sexo: str = Field(..., pattern="^[MF]$", description="Sexo: M o F")
    peso: Optional[float] = Field(None, ge=0, le=500, description="Peso en kg")
    talla: Optional[float] = Field(None, ge=0.3, le=3.0, description="Talla en metros")
    alergias: list[str] = Field(default_factory=list, description="Lista de alergias")
    diagnostico_medico: str = Field("", description="Diagnóstico médico actual")


class PatientCreate(BaseModel):
    qr_code: str = Field(..., description="Código QR único del paciente")
    personal_data: PersonalData


class PatientResponse(BaseModel):
    id: str
    qr_code: str
    personal_data: PersonalData
    created_at: datetime
    updated_at: datetime


class PatientUpdate(BaseModel):
    personal_data: Optional[PersonalData] = None
