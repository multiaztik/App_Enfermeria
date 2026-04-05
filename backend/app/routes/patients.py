"""
Rutas de Pacientes
CRUD de pacientes con búsqueda por código QR
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import Optional
from app.models.patient import PatientCreate, PatientResponse, PatientUpdate, PersonalData
from app.services.auth_service import get_current_user

router = APIRouter()

# Almacén temporal en memoria (reemplazar con MongoDB)
patients_db: dict[str, dict] = {
    "p1": {
        "id": "p1",
        "qr_code": "UAZ-2026-001",
        "personal_data": {
            "nombre": "Juan Pérez García",
            "edad": 45,
            "sexo": "M",
            "peso": 72.5,
            "talla": 1.68,
            "alergias": ["Penicilina"],
            "diagnostico_medico": "Diabetes Mellitus Tipo 2",
        },
        "created_at": datetime(2026, 1, 15, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 4, 3, tzinfo=timezone.utc),
    },
    "p2": {
        "id": "p2",
        "qr_code": "UAZ-2026-002",
        "personal_data": {
            "nombre": "María López Hernández",
            "edad": 62,
            "sexo": "F",
            "peso": 58.0,
            "talla": 1.55,
            "alergias": [],
            "diagnostico_medico": "Hipertensión Arterial",
        },
        "created_at": datetime(2026, 1, 20, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 4, 3, tzinfo=timezone.utc),
    },
    "p3": {
        "id": "p3",
        "qr_code": "UAZ-2026-003",
        "personal_data": {
            "nombre": "Carlos Ramírez Torres",
            "edad": 78,
            "sexo": "M",
            "peso": 50.2,
            "talla": 1.70,
            "alergias": ["Sulfonamidas", "Aspirina"],
            "diagnostico_medico": "Insuficiencia Cardíaca Congestiva",
        },
        "created_at": datetime(2026, 2, 1, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 4, 3, tzinfo=timezone.utc),
    },
}


@router.get("/", response_model=list[PatientResponse])
async def get_patients(
    search: Optional[str] = Query(None, description="Buscar por nombre o QR"),
    current_user: dict = Depends(get_current_user),
):
    """Obtener lista de pacientes con búsqueda opcional"""
    results = []
    for patient_data in patients_db.values():
        if search:
            name = patient_data["personal_data"]["nombre"].lower()
            qr = patient_data["qr_code"].lower()
            if search.lower() not in name and search.lower() not in qr:
                continue
        results.append(PatientResponse(
            id=patient_data["id"],
            qr_code=patient_data["qr_code"],
            personal_data=PersonalData(**patient_data["personal_data"]),
            created_at=patient_data["created_at"],
            updated_at=patient_data["updated_at"],
        ))
    return results


@router.get("/qr/{qr_code}", response_model=PatientResponse)
async def get_patient_by_qr(qr_code: str, current_user: dict = Depends(get_current_user)):
    """Buscar paciente por código QR"""
    for patient_data in patients_db.values():
        if patient_data["qr_code"] == qr_code:
            return PatientResponse(
                id=patient_data["id"],
                qr_code=patient_data["qr_code"],
                personal_data=PersonalData(**patient_data["personal_data"]),
                created_at=patient_data["created_at"],
                updated_at=patient_data["updated_at"],
            )
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Paciente con QR {qr_code} no encontrado",
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Obtener paciente por ID"""
    patient_data = patients_db.get(patient_id)
    if not patient_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    return PatientResponse(
        id=patient_data["id"],
        qr_code=patient_data["qr_code"],
        personal_data=PersonalData(**patient_data["personal_data"]),
        created_at=patient_data["created_at"],
        updated_at=patient_data["updated_at"],
    )


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientCreate, current_user: dict = Depends(get_current_user)):
    """Crear un nuevo paciente"""
    # Verificar QR único
    for p in patients_db.values():
        if p["qr_code"] == patient.qr_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código QR ya está registrado",
            )
    
    patient_id = f"p{len(patients_db) + 1}"
    now = datetime.now(timezone.utc)
    
    patients_db[patient_id] = {
        "id": patient_id,
        "qr_code": patient.qr_code,
        "personal_data": patient.personal_data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    
    return PatientResponse(
        id=patient_id,
        qr_code=patient.qr_code,
        personal_data=patient.personal_data,
        created_at=now,
        updated_at=now,
    )
