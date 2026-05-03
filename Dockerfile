FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .

EXPOSE 8000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:$PORT"]