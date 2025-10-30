# Allegro-Style Cart Application

A modern, production-ready shopping cart application inspired by Allegro.pl, featuring a React frontend with Tailwind CSS, Spring Boot backend with virtual threads, comprehensive security features, and enterprise-grade observability.

## 🎯 Project Overview

This application replicates the core shopping cart functionality found at `https://allegro.pl/koszyk` with modern architecture patterns and best practices. It demonstrates a complete full-stack implementation suitable for high-traffic e-commerce platforms.

### Key Features

**Shopping Cart Functionality:**
- ✅ Add, update, and remove items from cart with real-time updates
- ✅ Items grouped by seller with batch selection capabilities
- ✅ Quantity management (1-99 units per item)
- ✅ Price calculations with PLN currency formatting
- ✅ Empty cart state with recommended products carousel
- ✅ One-click add-to-cart from recommendations
- ✅ Responsive design for mobile, tablet, and desktop
- ✅ Dark mode support with system preference detection

**Security & Performance:**
- ✅ Per-user rate limiting (60 requests/minute with configurable thresholds)
- ✅ Input validation with Unicode normalization and allowlist patterns
- ✅ Form-based authentication (dev) / OAuth2 JWT (production)
- ✅ Session management with Spring Session JDBC
- ✅ Virtual threads for improved concurrency
- ✅ Optimistic concurrency control with ETags

**Developer Experience:**
- ✅ Feature-based architecture with limited package visibility
- ✅ Comprehensive test coverage (207+ tests passing)
- ✅ OpenAPI 3.0 specification with Swagger UI
- ✅ Hot reload for frontend development
- ✅ Docker support with multi-stage builds
- ✅ Pre-commit hooks with Husky and lint-staged

**Observability:**
- ✅ Structured JSON logging with request tracing
- ✅ Prometheus metrics with SLO buckets
- ✅ Health probes (liveness/readiness)
- ✅ Security event logging
- ✅ Performance monitoring with latency histograms

## 🏗️ Architecture

This application follows modern architectural patterns optimized for maintainability and scalability:

**Backend:**
- **Framework:** Spring Boot 3.5.6 with Java 25
- **Runtime:** Virtual threads enabled for improved concurrency
- **Architecture:** Feature-based package layout with limited visibility
- **Database:** H2 (development) / JDBC-compatible databases (production)
- **API:** REST with OpenAPI 3.0 specification
- **Security:** Form login (dev) / OAuth2 Resource Server with JWT (production)

**Frontend:**
- **Framework:** React 19.2.0 with TypeScript 5.9.3
- **Build Tool:** Vite 7.1.12 for fast HMR and optimized builds
- **Styling:** Tailwind CSS 4.1.13 with dark mode support
- **Routing:** TanStack Router (file-based routing)
- **State Management:** TanStack Query (React Query) with optimistic updates
- **HTTP Client:** Wretch with automatic retry logic and ETag support

For detailed architecture documentation, see [SPEC.md](spec/SPEC.md).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

**Required:**
- **Java 25** or later (Eclipse Temurin recommended)
- **Node.js 20+** and npm 10+ (for frontend development)
- **Git** for version control

**Optional:**
- **Docker** and Docker Compose (for containerized deployment)
- **MySQL 8.0+** or **PostgreSQL 15+** (for production database)

### Verify Installation

```bash
# Check Java version
java -version  # Should show version 25 or later

# Check Node.js version
node --version  # Should show v20.x or later

# Check Docker (optional)
docker --version
docker compose version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pigeon-project/allegro-style-cart-app.git
cd allegro-style-cart-app
```

### 2. Build the Project

Build both backend and frontend:

```bash
./gradlew build
```

This command:
- Compiles Java backend code
- Runs backend tests
- Builds frontend with Vite
- Runs frontend tests
- Packages everything into a Spring Boot JAR

### 3. Run Tests

Run all tests (backend + frontend):

```bash
./gradlew test
```

Run only backend tests:

```bash
./gradlew backend:test
```

Run only frontend tests:

```bash
cd frontend
npm test
```

Run end-to-end tests (requires running application):

```bash
cd frontend
npx playwright test
```

### 4. Run the Application

#### Option A: Local Development (Backend Only)

Start the backend server with hot reload:

```bash
./gradlew bootRun
```

The application will start on `http://localhost:8080`.

**Default credentials:**
- Username: `admin`
- Password: `password`

**Access the application:**
- Frontend (served by backend): http://localhost:8080/
- API Documentation (Swagger UI): http://localhost:8080/swagger-ui.html
- OpenAPI Spec (JSON): http://localhost:8080/v3/api-docs
- Health Check: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

#### Option B: Frontend Development (Hot Reload)

For frontend development with hot module replacement:

1. Start the backend:
   ```bash
   ./gradlew bootRun
   ```

2. In a separate terminal, start the frontend dev server:
   ```bash
   cd frontend
   npm install  # First time only
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

The frontend dev server will proxy API requests to the backend at `http://localhost:8080`.

#### Option C: Full Stack Development

Use two terminal windows for full hot reload on both frontend and backend changes.

## 🐳 Docker Deployment

The application includes a production-ready multi-stage Dockerfile for containerized deployment.

### Build the Docker Image

```bash
docker build -t allegro-cart:latest .
```

**Build process:**
- Uses multi-stage builds to separate build and runtime environments
- Builds backend with Java 25 using Gradle
- Builds frontend with Node.js and Vite (automatically via Gradle)
- Final image uses Eclipse Temurin JRE for minimal size (~389MB)
- Runs as non-root user (`spring:spring`) for security
- Includes health checks for liveness and readiness probes

### Run with Docker

**Development mode (H2 in-memory database):**

```bash
docker run -d \
  --name allegro-cart \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=default \
  allegro-cart:latest
```

**Production mode (external database):**

```bash
docker run -d \
  --name allegro-cart \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e JDBC_DATABASE_URL=jdbc:mysql://host.docker.internal:3306/cartdb \
  -e JDBC_DATABASE_USERNAME=cartuser \
  -e JDBC_DATABASE_PASSWORD=securepassword \
  allegro-cart:latest
```

### Docker Compose

For easier management with Docker Compose:

```bash
# Start the application (H2 database)
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop and remove containers
docker compose down
```

**To use MySQL with Docker Compose:**

1. Edit `docker-compose.yml` and uncomment the MySQL sections
2. Run `docker compose up -d`

The compose file includes complete setup for both H2 and MySQL configurations.

### Container Management

**View logs:**
```bash
docker logs -f allegro-cart
```

**Check health:**
```bash
# Liveness probe (container is alive)
curl http://localhost:8080/actuator/health/liveness

# Readiness probe (ready to receive traffic)
curl http://localhost:8080/actuator/health/readiness
```

**Stop and remove:**
```bash
docker stop allegro-cart
docker rm allegro-cart
```

## 🔧 Development Commands

### Backend Commands

```bash
# Build backend only
./gradlew backend:build

# Run backend tests
./gradlew backend:test

# Run backend with hot reload
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Generate JAR file
./gradlew backend:jar

# Run specific test class
./gradlew backend:test --tests CartControllerTest
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start dev server with hot reload (port 5173)
npm run dev

# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview

# Generate TypeScript types from OpenAPI spec
npm run generate-types
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

```bash
# Hooks automatically run on git commit
git add .
git commit -m "Your message"

# Manually run hooks
cd frontend
npm run format
npm run lint
```

## 📚 API Documentation

### OpenAPI / Swagger UI

Interactive API documentation is available via SpringDoc OpenAPI:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs
- **OpenAPI YAML:** http://localhost:8080/v3/api-docs.yaml

### Main API Endpoints

**Cart Operations:**
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update item quantity
- `DELETE /api/cart/items/{id}` - Remove specific item
- `DELETE /api/cart/items` - Remove multiple items or all items

**Authentication:**
- `POST /login` - Login (form-based, development mode)
- `POST /logout` - Logout

**Health & Monitoring:**
- `GET /actuator/health` - Overall health
- `GET /actuator/health/liveness` - Liveness probe
- `GET /actuator/health/readiness` - Readiness probe
- `GET /actuator/metrics` - Application metrics
- `GET /actuator/prometheus` - Metrics in Prometheus format

All API responses follow RFC7807 Problem Details format for errors.

For detailed API documentation, see [SPEC.md](spec/SPEC.md).

## ⚙️ Environment Variables

### Required (Production Mode)

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `production` |
| `JDBC_DATABASE_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/cartdb` |
| `JDBC_DATABASE_USERNAME` | Database username | `cartuser` |
| `JDBC_DATABASE_PASSWORD` | Database password | `securepassword` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Application HTTP port | `8080` |
| `JAVA_TOOL_OPTIONS` | JVM options | `-XX:MaxRAMPercentage=75.0 -XX:+UseZGC -XX:+ZGenerational` |

### Configuration Files

**application.yaml locations:**
- `backend/src/main/resources/application.yaml` - Main configuration
- `backend/src/main/resources/observability-alerts.yaml` - Alert configuration

**Rate limiting configuration:**
```yaml
rate-limit:
  enabled: true
  requests-per-minute: 60
```

### Database Configuration

**Development (default profile):**
- Uses H2 in-memory database
- Automatic schema initialization
- Data lost on restart

**Production (production profile):**
- Requires external MySQL/PostgreSQL database
- Schema initialization via environment variables
- Data persisted across restarts

**Supported databases:**
- MySQL 8.0+
- PostgreSQL 15+
- Any JDBC-compatible database

## 🔒 Security Features

### Rate Limiting

The application implements per-user rate limiting to prevent abuse:

**Configuration:**
- **Default limit:** 60 requests per minute per user
- **Rate limit headers** included in all responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- **HTTP 429** returned when limit exceeded with `Retry-After` header

**Testing rate limiting:**

1. Start the application:
   ```bash
   ./gradlew bootRun
   ```

2. Login and get a session cookie:
   ```bash
   curl -c cookies.txt -X POST http://localhost:8080/login \
     -d "username=admin&password=password" \
     --location
   ```

3. Make multiple requests to test rate limiting:
   ```bash
   for i in {1..65}; do
     echo "Request $i:"
     curl -b cookies.txt -v http://localhost:8080/api/cart 2>&1 | grep -E "(< HTTP|< X-RateLimit)"
   done
   ```

**Expected results:**
- First 60 requests return HTTP 200 with decreasing `X-RateLimit-Remaining`
- Requests 61+ return HTTP 429 with `Retry-After` header

**Configuration in application.yaml:**
```yaml
rate-limit:
  enabled: true
  requests-per-minute: 60
```

### Input Validation

All text inputs are secured against injection attacks:
- ✅ Trimmed of whitespace
- ✅ Normalized to NFC Unicode form
- ✅ Validated against allowlists to prevent injection attacks
- ✅ Product titles accept: letters, numbers, spaces, and common punctuation

### Authentication & Authorization

**Development mode (default profile):**
- Form-based authentication
- In-memory user: `admin` / `password`
- Session-based security with CSRF protection

**Production mode (production profile):**
- OAuth2 Resource Server with JWT validation
- JWT validation against GitHub OIDC provider
- Stateless authentication for horizontal scaling

### Session Management

- JDBC-based HTTP sessions via Spring Session
- Session persistence across application restarts
- Horizontal scalability support
- Configurable session timeout

## 🔍 Observability

### Logging

**Structured JSON logging** with the following fields:
- `timestamp`: ISO-8601 format
- `level`: Log level (INFO, WARN, ERROR)
- `service`: Application name
- `environment`: Deployment environment
- `requestId`: Unique request identifier for tracing
- `route`: HTTP method and URI path
- `durationMs`: Request duration in milliseconds
- `status`: HTTP status code

**Request tracing:**
- Automatic `X-Request-ID` header generation
- Per-request logging with duration metrics
- Status-based log levels (INFO for 2xx/3xx, WARN for 4xx, ERROR for 5xx)

### Metrics

**Available metrics endpoints:**
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus-compatible metrics

**Key metrics:**
- **Performance:** RPS, latency percentiles (p50, p90, p95, p99)
- **Errors:** Error rates by status class (4xx/5xx)
- **Saturation:** JVM memory, CPU usage
- **SLO buckets:** 50ms, 100ms, 200ms, 250ms, 400ms, 500ms, 1s, 2s

### Health Checks

- `/actuator/health` - Overall health status
- `/actuator/health/liveness` - Liveness probe (container is alive)
- `/actuator/health/readiness` - Readiness probe (ready to serve traffic)

### Service Level Objectives (SLOs)

- **Availability:** 99.9% uptime per month
- **Read latency p95:** ≤250ms
- **Write latency p95:** ≤400ms
- **Error budget:** 0.1%

For detailed observability documentation, see [OBSERVABILITY.md](OBSERVABILITY.md).

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use

**Problem:** Error starting application - port 8080 already in use

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or use a different port
./gradlew bootRun --args='--server.port=8081'
```

#### Frontend Can't Connect to Backend

**Problem:** API calls fail with CORS or connection errors

**Solution:**
1. Ensure backend is running on port 8080: `./gradlew bootRun`
2. Check Vite proxy configuration in `frontend/vite.config.ts`
3. Verify proxy target: `http://localhost:8080`

#### Tests Fail

**Problem:** Tests fail during build

**Solution:**
```bash
# Clean build artifacts
./gradlew clean

# Run tests with debug output
./gradlew test --info

# Run specific test
./gradlew backend:test --tests CartControllerTest --info
```

#### Docker Build Fails

**Problem:** Docker build fails with Gradle errors

**Solution:**
```bash
# Clean local build artifacts
./gradlew clean

# Rebuild with fresh cache
docker build --no-cache -t allegro-cart:latest .

# Check Docker daemon memory (increase if needed)
docker info | grep Memory
```

#### Database Connection Errors (Production)

**Problem:** Cannot connect to database in production mode

**Solution:**
1. Verify database is running and accessible
2. Check JDBC URL format: `jdbc:mysql://hostname:3306/database`
3. Verify credentials: `JDBC_DATABASE_USERNAME` and `JDBC_DATABASE_PASSWORD`
4. Check network connectivity from container to database
5. For Docker: use `host.docker.internal` instead of `localhost`

#### Rate Limit 429 Errors

**Problem:** Getting HTTP 429 Too Many Requests

**Solution:**
1. Wait for rate limit window to reset (check `X-RateLimit-Reset` header)
2. Reduce request frequency
3. Configure higher limits in `application.yaml`:
   ```yaml
   rate-limit:
     requests-per-minute: 120  # Increase as needed
   ```

#### H2 Console Not Available

**Problem:** Cannot access H2 database console

**Solution:**
H2 console is disabled by default for security. To enable for debugging:
```yaml
spring:
  h2:
    console:
      enabled: true
```
Then access at: http://localhost:8080/h2-console

#### Session Lost After Restart

**Problem:** Session lost after application restart in development mode

**Solution:**
Development mode uses H2 in-memory database which is reset on restart. This is expected behavior. For persistent sessions, use production mode with external database.

### Getting Help

- **Issues:** https://github.com/pigeon-project/allegro-style-cart-app/issues
- **Documentation:** [SPEC.md](spec/SPEC.md), [SHARED-NFR.md](spec/SHARED-NFR.md)
- **Logs:** Check application logs for detailed error messages

### Debug Mode

Run with debug logging:
```bash
./gradlew bootRun --args='--logging.level.com.github.pigeon=DEBUG'
```

## 📖 Documentation

### Project Documentation

- **[SPEC.md](spec/SPEC.md)** - Complete application specification
  - Product overview and functional requirements
  - Technical infrastructure (frontend & backend)
  - Domain model implementation
  - REST API endpoints and error handling
  - Security, observability, and deployment details
  
- **[SHARED-NFR.md](spec/SHARED-NFR.md)** - Organization-wide non-functional requirements
  - Reliability, availability, and performance standards
  - Security, privacy, and observability requirements
  - API evolution and data integrity guidelines
  - Error handling and rate limiting standards

- **[OBSERVABILITY.md](OBSERVABILITY.md)** - Observability implementation guide
  - Structured JSON logging
  - Metrics collection and SLOs
  - Health checks and alerting
  - Security event logging

### Technology Stack Documentation

**Backend:**
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html)
- [Spring Security OAuth2](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/)
- [Spring Session JDBC](https://docs.spring.io/spring-session/reference/guides/boot-jdbc.html)
- [SpringDoc OpenAPI](https://springdoc.org/)

**Frontend:**
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)

**Testing:**
- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

### Code Style

**Backend (Java):**
- Follow Java naming conventions
- Use Records for immutable data
- Prefer `@Configuration` over `@Component`
- Package by feature, not by layer
- Limit package visibility (use package-private)

**Frontend (TypeScript/React):**
- Use named functions over const with arrow functions
- Default export on named function components
- Prefer `userEvent` over `fireEvent` in tests
- Avoid `useEffect` whenever possible
- Use React Query with optimistic updates

### Testing Requirements

- Maintain test coverage for new features
- Backend: JUnit 5 with Spring Boot Test
- Frontend: Vitest + React Testing Library
- E2E: Playwright for critical user flows

### Commit Guidelines

The project uses Husky pre-commit hooks:
- Code is automatically formatted with Prettier
- Linting is enforced before commits
- All tests must pass before pushing

## 📄 License

This project is part of the pigeon-project organization.

## 🙏 Acknowledgments

- Inspired by [Allegro.pl](https://allegro.pl) shopping cart design
- Built with modern Spring Boot and React best practices
- Follows organizational NFR standards for production readiness

---

**Quick Links:**
- 📘 [Full Specification](spec/SPEC.md)
- 🔐 [Security & NFR](spec/SHARED-NFR.md)
- 📊 [Observability Guide](OBSERVABILITY.md)
- 🐛 [Issue Tracker](https://github.com/pigeon-project/allegro-style-cart-app/issues)
