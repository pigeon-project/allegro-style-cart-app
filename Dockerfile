# Multi-stage Dockerfile for Allegro-Style Cart Application
# Builds both backend (Java/Gradle) and frontend (Node/Vite) in separate stages
# Final image uses Eclipse Temurin JRE for minimal size and security

# ============================================
# Stage 1: Build Backend with Gradle
# ============================================
FROM eclipse-temurin:25-jdk AS backend-builder

WORKDIR /workspace

# Copy Gradle wrapper and build files first (for better layer caching)
COPY gradlew gradlew.bat ./
COPY gradle gradle
COPY settings.gradle.kts gradle.properties ./
COPY build.gradle.kts ./

# Copy backend and frontend build files
COPY backend/build.gradle.kts backend/
COPY frontend/build.gradle.kts frontend/

# Download dependencies (cached if build files haven't changed)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY backend/src backend/src
COPY frontend frontend

# Build the application (includes frontend build via Gradle task)
# Skip tests as they're excluded from Docker context and should run in CI
RUN ./gradlew clean build -x test -x frontend:npmTest --no-daemon

# ============================================
# Stage 2: Runtime Image (Eclipse Temurin JRE)
# ============================================
FROM eclipse-temurin:25-jre AS runtime

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

WORKDIR /app

# Copy the built JAR from builder (uses workspace name due to settings)
COPY --from=backend-builder --chown=spring:spring /workspace/build/libs/workspace.jar app.jar

# Switch to non-root user
USER spring:spring

# Change SPRING_PROFILES_ACTIVE to production in case of production deployment and using external database
# default means using internal in-memory database
ENV SPRING_PROFILES_ACTIVE=default \
    JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=25.0 -XX:MaxRAMPercentage=75.0 -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=20 -XX:+UseZGC -XX:+ZGenerational" \
    SERVER_PORT=8080

# Expose application port
EXPOSE 8080

# Health check using actuator liveness endpoint (SHARED-NFR Section 2)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Labels for metadata
LABEL maintainer="pigeon-project" \
      version="1.0" \
      description="Allegro-Style Cart Application - Production Container"
