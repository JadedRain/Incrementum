# Use official Python image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir pytest
# Copy the rest of your project
COPY . .



# Default command: run tests with pytest
CMD ["pytest", "-v"]
