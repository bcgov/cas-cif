import os

# api key
STORAGE_API_KEY = os.getenv('STORAGE_API_KEY')
API_V1_STR = "/api/v1"
PROJECT_NAME = os.getenv('PROJECT_NAME', 'cif-storage')
BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost, http://localhost:4200, http://localhost:3000, http://localhost:8080")
ENABLE_UVICORN_ACCESS_LOG = os.getenv('ENABLE_UVICORN_ACCESS_LOG', False)
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY')
MINIO_HOST_URL = os.getenv('MINIO_HOST_URL')
ATTACHMENTS_BUCKET_NAME = os.getenv('ATTACHMENTS_BUCKET_NAME', "attachments")
ALLOWED_FILE_EXTENSIONS = [".gif", ".jpg", ".jpeg", ".txt", ".geojson", ".json",
                           ".png", ".pdf", ".doc", ".docx", ".csv", ".xlsx", ".kml"]
