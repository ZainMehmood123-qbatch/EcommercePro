# app/routes/products.py
from fastapi import APIRouter, UploadFile, File
from app.tasks import import_products_from_csv

router = APIRouter()


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    import_products_from_csv.delay(content.decode("utf-8"))
    return {"message": "✅ CSV upload started. Products will be added in background."}
