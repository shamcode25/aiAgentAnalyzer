"""FastAPI app: health and analyze endpoints, CORS for Streamlit."""
import os
import tempfile

from fastapi import FastAPI, HTTPException, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from app.config import OPENAI_API_KEY
from app.schemas import AnalyzeRequest, FullAnalysisResponse
from app.services.pipeline import run_pipeline

app = FastAPI(title="Care Navigator Agent", version="0.1.0")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8501", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api_router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@api_router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)) -> dict[str, str]:
    """Transcribe audio file using OpenAI Whisper API."""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
    
    # Validate file type (lenient - some browsers may not send correct content-type)
    if file.content_type and not file.content_type.startswith("audio/"):
        # Check file extension as fallback
        if file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            audio_extensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm', '.aac', '.opus']
            if ext not in audio_extensions:
                raise HTTPException(status_code=400, detail=f"File must be an audio file. Got: {ext}")
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        # Read file content
        contents = await file.read()
        
        # Create a temporary file-like object for OpenAI
        suffix = os.path.splitext(file.filename or "audio.mp3")[1] or ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Transcribe using Whisper
            with open(tmp_path, "rb") as audio_file:
                transcript_obj = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="en",  # Optional: specify language
                )
            transcript_text = transcript_obj.text
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
        
        return {"transcript": transcript_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@api_router.post("/analyze", response_model=FullAnalysisResponse)
def analyze(body: AnalyzeRequest) -> FullAnalysisResponse:
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")
    return run_pipeline(
        transcript=body.transcript,
        caller_context=body.caller_context,
        channel=body.channel,
        debug=body.debug,
    )

# Keep root /health for Render health checks
@app.get("/health")
def root_health() -> dict[str, str]:
    return {"status": "ok"}

app.include_router(api_router)
