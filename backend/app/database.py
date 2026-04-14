"""
Conexión a MongoDB con Motor (AsyncIO)
Base de datos: nurse_assess
Colecciones: users, patients, assessments
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_db():
    """Conectar a MongoDB al iniciar la aplicación"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"[OK] MongoDB conectado: {settings.MONGODB_URL}")


async def close_db():
    """Cerrar conexión al terminar"""
    if db.client:
        db.client.close()
        print("[CLOSE] MongoDB desconectado")


def get_database():
    """Retorna la base de datos 'nurse_assess'"""
    return db.client[settings.DATABASE_NAME]


def get_users_collection():
    return get_database()["users"]


def get_patients_collection():
    return get_database()["patients"]


def get_assessments_collection():
    return get_database()["assessments"]
