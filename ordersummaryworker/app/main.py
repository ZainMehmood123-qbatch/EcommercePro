# app/main.py
from fastapi import FastAPI
from .tasks import recalculate_summary
from .routes import products
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    recalculate_summary.delay()
    return {"message": "Recalculation started!"}

# new route
app.include_router(products.router, prefix="/products", tags=["Products"])