# app/main.py
from fastapi import FastAPI
from .tasks import recalculate_summary

app = FastAPI()

@app.get("/")
def root():
    recalculate_summary.delay()
    return {"message": "Recalculation started!"}
