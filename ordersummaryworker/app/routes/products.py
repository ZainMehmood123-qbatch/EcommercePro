import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File
from app.tasks import import_products_from_csv

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    ✅ Streaming upload — file is saved temporarily, not read fully into memory.
    ✅ Celery task processes it line-by-line.
    """
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(UPLOAD_DIR, temp_filename)

    # Save uploaded file to disk (streamed)
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Pass only file path to Celery, not full content
    import_products_from_csv.delay(temp_filepath)

    return {"message": "✅ CSV upload started. Products will be added in background."}
