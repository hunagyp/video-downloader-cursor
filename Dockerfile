# Multi-stage build for smaller final image
# Stage 1: Build stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package.json ./
RUN npm install --silent

COPY src/ src/
COPY public/ public/
RUN npm run build

# Stage 2: Python build stage
FROM python:3.11-alpine AS python-builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    curl \
    ffmpeg \
    && pip install --no-cache-dir --user pip-tools

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 3: Final runtime stage
FROM python:3.11-alpine AS runtime
WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    && adduser -D -s /bin/sh appuser

# Copy Python packages from builder stage
COPY --from=python-builder /root/.local /home/appuser/.local

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/build ./build

# Copy application files
COPY app.py .
COPY config/ ./config/
COPY entrypoint.sh .

# Create necessary directories and set permissions
RUN mkdir -p /app/data /app/config \
    && chown -R appuser:appuser /app \
    && chmod +x /app/entrypoint.sh

# Switch to non-root user
USER appuser

# Add local Python packages to PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/test || exit 1

# Run the application with entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--worker-class", "sync", "--worker-connections", "1000", "--max-requests", "1000", "--max-requests-jitter", "100", "--timeout", "30", "--keep-alive", "2", "app:app"]