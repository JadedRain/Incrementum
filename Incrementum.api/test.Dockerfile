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

# Set environment variable for Django test settings
ENV DJANGO_SETTINGS_MODULE=api_project.settings_test


# Apply migrations and run tests
CMD ["sh", "-c", "python manage.py migrate && pytest -v"]
