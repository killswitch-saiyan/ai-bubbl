from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.comics import router as comics_router
from app.api.sessions import router as sessions_router

app = FastAPI(
    title="Bubbl API",
    description="AI-powered interactive comic reading app",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(comics_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to Bubbl API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}