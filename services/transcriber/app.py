import os
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel

# Configuration from environment variables
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "large-v3")
COMPUTE_TYPE = os.environ.get("COMPUTE_TYPE", "int8")
DEVICE = "cuda"  # Use GPU

app = FastAPI()
model = None

@app.on_event("startup")
def load_whisper_model():
    global model
    try:
        print(f"Loading Faster-Whisper model: {WHISPER_MODEL} with compute type: {COMPUTE_TYPE}")
        model = WhisperModel(
            WHISPER_MODEL,
            device=DEVICE,
            compute_type=COMPUTE_TYPE
        )
        print(f"Whisper model loaded successfully on GPU")
    except Exception as e:
        print(f"FATAL ERROR loading Whisper model: {e}")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not model:
        return {"error": "Whisper model not loaded"}, 500
    
    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Transcribe
        segments, info = model.transcribe(temp_path, beam_size=5)
        
        # Collect results
        transcription = " ".join([segment.text for segment in segments])
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "status": "success",
            "transcription": transcription,
            "language": info.language,
            "duration": info.duration
        }
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": WHISPER_MODEL,
        "device": DEVICE,
        "model_loaded": model is not None
    }