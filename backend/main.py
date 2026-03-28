from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query

app = FastAPI(title="Nexus API", version="1.0.0")

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(query.router, prefix="/api/query", tags=["Query"])

@app.get("/")
def health_check():
    return {"status": "Nexus API is running"}
