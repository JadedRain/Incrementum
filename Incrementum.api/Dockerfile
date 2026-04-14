FROM python:3.13-slim

WORKDIR /Incrementum.api

COPY . .

ENV PIP_DISABLE_PIP_VERSION_CHECK=1

RUN python -m pip install --no-cache-dir --upgrade pip && \
		for i in 1 2 3; do \
			python -m pip install --no-cache-dir --retries 10 --timeout 120 -r requirements.txt && break; \
			echo "pip install failed on attempt ${i}, retrying..."; \
			if [ "$i" -eq 3 ]; then exit 1; fi; \
		done

EXPOSE 8000
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:8000"]