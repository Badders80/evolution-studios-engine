import spacy
import re
from fastapi import FastAPI
from pydantic import BaseModel

# 1. Load spacy model for Named Entity Recognition (NER)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("WARNING: spaCy model not found. Running simple entity extraction.")
    nlp = None

app = FastAPI()

# Data Contract for the incoming transcript (from Transcriber)
class RawTranscript(BaseModel):
    asset_id: str
    transcript: str

# Data Contract for the outgoing refined pack (to Refiner)
class EnrichmentOutput(BaseModel):
    asset_id: str
    clean_text: str
    entities: dict

# 2. Brand Compliance Rules (Derived from Brand Bible)
JARGON_MAPPING = {
    # Replace Jargon with professional, "Understated Authority" terms
    r'\bjuice\b': 'fuel',
    r'\bfurlong\b': 'stretch',
    r'\breckons\b': 'believes',
    r'\bgame-changer\b': 'significant breakthrough',
}
BANNED_PHRASES = [
    "disrupting the industry",
    "revolutionary", 
    "game-changing", 
    "cutting-edge tech", 
    "democratising ownership"
]  # Source: Brand Bible, Banned/Avoided Language

def clean_and_tag(text: str) -> EnrichmentOutput:
    # 2a. Simple Jargon Stripping via Regex
    clean_text = text
    for jargon, replacement in JARGON_MAPPING.items():
        clean_text = re.sub(jargon, replacement, clean_text, flags=re.IGNORECASE)

    # 2b. Remove Banned Hype Phrases entirely (Brand Compliance Guardrail)
    for phrase in BANNED_PHRASES:
        clean_text = re.sub(phrase, '', clean_text, flags=re.IGNORECASE).strip()
    
    # 2c. Entity Recognition (M-V-P implementation)
    extracted_entities = {}
    if nlp:
        doc = nlp(text)
        # Identify PEOPLE and ORG entities as placeholders for Trainer/Owner names
        extracted_entities['people'] = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        extracted_entities['orgs'] = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        # Basic date extraction
        extracted_entities['dates'] = [ent.text for ent in doc.ents if ent.label_ == "DATE"]

    return EnrichmentOutput(
        asset_id="simulated-id-123",
        clean_text=clean_text,
        entities=extracted_entities
    )

# 3. API Endpoint
@app.post("/enrich", response_model=EnrichmentOutput)
def enrich_transcript(raw_data: RawTranscript):
    """
    Takes raw transcript, performs jargon stripping and NER, and returns clean, structured data.
    """
    result = clean_and_tag(raw_data.transcript)
    return result

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "enrich-svc", "compute": "cpu"}
