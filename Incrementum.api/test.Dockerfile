# Use official Python image
FROM python:3.11-slim

# Set work directory inside container
WORKDIR /app

# Install system dependencies if needed (optional)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project
COPY . .

# Default command: run tests with pytest
CMD ["pytest", "-v"]
