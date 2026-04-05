"""
Modelos Pydantic para Valoraciones Clínicas
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class NandaSuggestion(BaseModel):
    nanda_code: str = Field(..., description="Código NANDA-I")
    diagnosis: str = Field(..., description="Nombre del diagnóstico")
    priority: str = Field(..., pattern="^(high|medium|low)$")
    evidence: list[str] = Field(default_factory=list)


class AssessmentCreate(BaseModel):
    patient_id: str = Field(..., description="ID del paciente")
    patterns: dict[str, dict[str, Any]] = Field(
        default_factory=dict,
        description="Datos de los patrones evaluados"
    )


class AssessmentResponse(BaseModel):
    id: str
    patient_id: str
    nurse_id: str
    date: datetime
    patterns: dict[str, dict[str, Any]]
    suggestions: list[NandaSuggestion]
    status: str
    synced: bool
    created_at: datetime


class AssessmentUpdate(BaseModel):
    patterns: Optional[dict[str, dict[str, Any]]] = None
    status: Optional[str] = None
