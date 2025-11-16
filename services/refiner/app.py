import os
from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama

# 1. Configuration 
MODEL_PATH = os.environ.get("MODEL_PATH", "/app/models/")
MODEL_NAME = os.environ.get("MODEL_NAME", "mistral-7b-finetune.gguf")
N_GPU_LAYERS = int(os.environ.get("N_GPU_LAYERS", "-1")) # -1 loads all layers to VRAM
N_CTX = int(os.environ.get("N_CTX", "4096"))

app = FastAPI()
model = None

# Request model for JSON body
class RefineRequest(BaseModel):
    raw_text: str
    system_prompt: str = None  # Optional override for custom system prompts

@app.on_event("startup")
def load_llm():
    global model
    try:
        print(f"Loading LLM: {MODEL_NAME} from {MODEL_PATH}...")
        # Llama-cpp-python initialization
        model = Llama(
            model_path=os.path.join(MODEL_PATH, MODEL_NAME),
            n_gpu_layers=N_GPU_LAYERS,
            n_ctx=N_CTX,
            verbose=True
        )
        print(f"LLM loaded successfully with {model.n_gpu_layers} layers offloaded to RTX 3060.")
    except Exception as e:
        print(f"FATAL ERROR loading LLM: {e}")
        # In production, you might want to stop the service here.

# 2. API Endpoint for Text Refinement
@app.post("/refine_text")
async def refine_text(request: RefineRequest):
    if not model:
        return {"error": "LLM not loaded"}, 500

    # Define the comprehensive Brand Bible-aligned system prompt
    default_system_prompt = (
        "You are the Evolution Stables Language Enhancement Layer (L.E.L.). "
        "Your sole function is to take raw, unrefined text regarding racehorse training, performance, or asset status "
        "and transform it into the official Evolution Stables brand voice.\n\n"
        "**VOICE & TONE:** Understated Authority. You are declarative, confident, and calm. "
        "You prove innovation; you do not shout hype.\n"
        "**BRAND ESSENCE:** You are a bridge between the paddock (heritage) and the protocol (innovation).\n"
        "**CORE PROMISE:** Ownership, evolved. You are the benchmark.\n\n"
        "**MANDATES:**\n"
        "1. **Clarity First, Poetry Second**.\n"
        "2. **Use Active Voice** (e.g., 'We build,' not 'is built').\n"
        "3. **Replace Hype with Proof** (e.g., 'Regulated' over 'Revolutionary').\n"
        "4. **Avoid Banned Language** (e.g., 'disrupting,' 'revolutionary,' 'game-changing').\n"
        "5. **Maintain a Human, Relatable Tone**.\n"
        "6. **Always use British English** (e.g., 'colour', 'modernise').\n\n"
        "**REFINEMENT DIRECTIVES:**\n"
        "- AVOID phrases like 'juice,' 'game-changer,' 'reckons,' and 'massive.' "
        "Replace with professional equivalents like 'energy,' 'significant breakthrough,' 'believes,' and 'substantial'.\n"
        "- Replace technical racing jargon (e.g., 'furlong') with clearer, accessible terms "
        "('stretch,' 'final distance') to promote clarity for investors and fans alike.\n"
        "- If a call to action is required, use phrases that reflect access and community, "
        "such as: 'Join the movement,' or 'This is ownership, evolved'.\n\n"
        "Transform the following text while maintaining these principles."
    )
    
    # Use custom system prompt if provided, otherwise use default
    system_prompt = request.system_prompt if request.system_prompt else default_system_prompt
    
    # Mistral 7B Instruct format for the prompt
    prompt = f"<s>[INST] {system_prompt}\n\nRefine the following text: \"{request.raw_text}\" [/INST]"
    
    output = model(
        prompt,
        max_tokens=512,
        stop=["</s>", "[INST]"],
        temperature=0.7
    )
    
    # Extract the response text
    refined_text = output["choices"][0]["text"].strip()
    
    return {
        "status": "success",
        "refined_text": refined_text
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None, "device": "cuda"}