# Start from NVIDIA base image with CUDA development tools
FROM nvidia/cuda:12.3.2-cudnn9-devel-ubuntu22.04 

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3-pip \
    python3-dev \
    build-essential \
    cmake \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Install llama-cpp-python with CUDA support
# These environment variables are crucial for forcing GPU compilation
WORKDIR /app
COPY requirements.txt .

# Copy CUDA driver stubs to system path where linker expects them
RUN cp /usr/local/cuda/lib64/stubs/libcuda.so /usr/local/cuda/lib64/stubs/libcuda.so.1 && \
    cp /usr/local/cuda/lib64/stubs/libnvidia-ml.so /usr/local/cuda/lib64/stubs/libnvidia-ml.so.1

# Now run the CUDA-enabled compilation with stubs in library path
RUN LD_LIBRARY_PATH=/usr/local/cuda/lib64/stubs:$LD_LIBRARY_PATH \
    CMAKE_ARGS="-DGGML_CUDA=on" FORCE_CMAKE=1 CUDACXX=/usr/local/cuda/bin/nvcc \
    pip3 install --no-cache-dir -r requirements.txt
    
# Copy application code
COPY app.py .

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]