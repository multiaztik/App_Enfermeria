"""
NurseAssess API - Entry Point
FastAPI application for clinical nursing assessment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, patients, assessments

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para la aplicación de valoración clínica de enfermería basada en los Patrones Funcionales de Gordon",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(patients.router, prefix="/api/patients", tags=["Pacientes"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Valoraciones"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
