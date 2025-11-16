FROM python:3.11-slim

# Install FFmpeg for audio extraction
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY scraper_service.py .

# Expose port
EXPOSE 8003

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8003", "--workers", "2", "--timeout", "300", "app:app"]
