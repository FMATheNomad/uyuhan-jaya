FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine AS wa-build
WORKDIR /wa
COPY whatsapp-service/package.json whatsapp-service/package-lock.json* ./
RUN npm ci --production
COPY whatsapp-service/ .

FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Python backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# WhatsApp service
COPY --from=wa-build /wa /app/whatsapp-service
RUN mkdir -p /app/whatsapp-service/auth

# Frontend
COPY --from=frontend-build /frontend/dist /app/frontend/dist

RUN mkdir -p /app/uploads/general /app/uploads/attendance /app/uploads/progress /app/uploads/rab

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} & node /app/whatsapp-service/index.js & wait"]
