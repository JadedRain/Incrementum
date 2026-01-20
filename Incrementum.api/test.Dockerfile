FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir pytest pytest-django

# Copy project
COPY . .

# Debug: Check what was copied
RUN echo "=== Checking working directory ===" && pwd && ls -la
RUN echo "=== Migration files ===" && ls -la Incrementum/migrations/*.py | head -20

# Clean any Python cache files
RUN find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
RUN find . -name "*.pyc" -delete 2>/dev/null || true

# Apply migrations and run tests
CMD ["sh", "-c", "python manage.py migrate --settings=api_project.settings_test && pytest -v"]
