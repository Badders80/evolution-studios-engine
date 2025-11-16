FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies and spacy model
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download a base English language model for spaCy
RUN python3 -m spacy download en_core_web_sm

# Copy application code
COPY app.py .

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]
