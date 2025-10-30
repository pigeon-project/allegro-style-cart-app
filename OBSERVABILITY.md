# Observability Guide

This document describes the observability features implemented in the Allegro-style cart application, including logging, metrics, and alerting.

## Overview

The application implements comprehensive observability aligned with organizational NFR requirements:
- Structured JSON logging with request tracing
- Metrics collection for performance monitoring
- Security event logging
- Alert configurations for SLO violations

## Logging

### Structured JSON Format

All logs are emitted in structured JSON format with the following fields:

```json
{
  "timestamp": "2025-10-30T10:00:42.915Z",
  "level": "INFO",
  "service": "allegro-cart-backend",
  "environment": "default",
  "requestId": "test-request-123",
  "route": "GET /api/cart",
  "thread": "tomcat-handler-4",
  "logger": "c.g.p.o.RequestLoggingFilter",
  "message": "Request completed: method=GET uri=/api/cart status=200 durationMs=40",
  "exception": ""
}
```

### Request Tracing

Each HTTP request is assigned a unique `requestId`:
- If client provides `X-Request-ID` header, it is used
- Otherwise, a UUID is auto-generated
- The `requestId` is included in response headers and all log entries
- MDC (Mapped Diagnostic Context) ensures correlation across log entries

### Log Levels by Status Code

- **INFO** (2xx, 3xx): Successful requests
- **WARN** (4xx): Client errors (bad requests, unauthorized, not found)
- **ERROR** (5xx): Server errors

### Privacy Compliance

- **No raw PII**: Logs contain only hashed/ID references (user IDs, cart IDs)
- **No sensitive data**: Passwords, tokens, credit cards never logged
- **Sanitized paths**: Query parameters that might contain sensitive data are preserved as-is but logged separately

### Performance Metrics in Logs

Each request log includes:
- `method`: HTTP method (GET, POST, PUT, DELETE)
- `uri`: Request path
- `status`: HTTP status code
- `durationMs`: Request duration in milliseconds

### Excluded Endpoints

Actuator health check endpoints (`/actuator/*`) are excluded from detailed request logging to reduce noise.

## Metrics

### Exposed Endpoints

- **Metrics API**: `GET /actuator/metrics`
- **Prometheus**: `GET /actuator/prometheus`
- **Health**: `GET /actuator/health`
- **Info**: `GET /actuator/info`

### Core Metrics

#### Request Metrics
- **Name**: `http.server.requests`
- **Type**: Histogram with percentiles
- **Percentiles**: p50, p90, p95, p99
- **Tags**: method, uri, status, outcome, exception, environment
- **Measurements**: COUNT, TOTAL_TIME, MAX

#### Latency Targets (SLOs)
- Read endpoints (GET): p95 ≤ 250ms
- Write endpoints (POST, PUT, DELETE): p95 ≤ 400ms
- SLO buckets: 50ms, 100ms, 200ms, 250ms, 400ms, 500ms, 1s, 2s

#### Error Rate Metrics
- 4xx client errors by endpoint
- 5xx server errors by endpoint
- Error rate as percentage of total requests

### Saturation Metrics

#### JVM Memory
- `jvm.memory.used`: Current memory usage
- `jvm.memory.max`: Maximum heap size
- `jvm.memory.committed`: Committed memory
- `jvm.gc.pause`: Garbage collection pauses

#### CPU Usage
- `system.cpu.usage`: System-wide CPU usage (0.0 to 1.0)
- `process.cpu.usage`: Process-specific CPU usage

#### Thread Pool
- `tomcat.threads.busy`: Active request threads
- `tomcat.threads.current`: Current thread count

### Common Tags

All metrics include:
- `application`: allegro-cart-backend
- `environment`: default (or SPRING_PROFILES_ACTIVE value)

## Security Event Logging

### Authentication Events

**Successful Authentication**:
```json
{
  "level": "INFO",
  "logger": "c.g.p.o.SecurityEventLogger",
  "message": "Authentication successful: username=admin"
}
```

**Failed Authentication**:
```json
{
  "level": "WARN",
  "logger": "c.g.p.o.SecurityEventLogger",
  "message": "Authentication failed: username=admin errorType=BadCredentialsException message=Bad credentials"
}
```

### Authorization Events

**Authorization Denied**:
```json
{
  "level": "WARN",
  "logger": "c.g.p.o.SecurityEventLogger",
  "message": "Authorization denied: username=user123 resource=AuthorizationDecision [granted=false]"
}
```

## Alert Configuration

Alert thresholds are defined in `observability-alerts.yaml`. Integrate these with your monitoring system (Prometheus AlertManager, Grafana, Datadog, etc.).

### Critical Alerts

1. **Elevated 5xx Error Rate**
   - Threshold: >5% of requests over 5 minutes
   - Action: Investigate server errors, check logs, verify dependencies

2. **Read Endpoint Latency Breach (p95)**
   - Threshold: >250ms
   - Endpoints: GET /api/cart
   - Action: Check database performance, query optimization

3. **Write Endpoint Latency Breach (p95)**
   - Threshold: >400ms
   - Endpoints: POST, PUT, DELETE /api/cart/items
   - Action: Check database write performance, connection pool

4. **p99 Latency Breach**
   - Threshold: >1000ms over 5 minutes
   - Action: Investigate outliers, check for slow queries

5. **Abnormal Error Rate**
   - Threshold: >10% of requests over 5 minutes
   - Action: Check for validation errors, API contract issues

### Resource Alerts

6. **Memory Saturation**
   - Threshold: >90% of max heap
   - Action: Check for memory leaks, increase heap size, optimize memory usage

7. **CPU Saturation**
   - Threshold: >80% CPU usage over 5 minutes
   - Action: Scale horizontally, optimize hot code paths

8. **Authentication Failure Spike**
   - Threshold: >10 failures per minute
   - Action: Investigate potential security attack, check credentials

## Monitoring Integration

### Prometheus

Configure Prometheus to scrape metrics:

```yaml
scrape_configs:
  - job_name: 'allegro-cart-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

### Grafana Dashboards

Recommended dashboard panels:
1. Request Rate (RPS) - Time series
2. Latency Percentiles (p50, p90, p95, p99) - Time series
3. Error Rate by Status Code - Gauge
4. JVM Memory Usage - Gauge
5. CPU Usage - Gauge
6. Active Threads - Time series

### Log Aggregation

Use ELK stack, Splunk, or cloud logging services to:
- Aggregate JSON logs
- Index by requestId for trace viewing
- Alert on error patterns
- Create dashboards for error rates

## Service Level Objectives (SLOs)

- **Availability**: 99.9% uptime per month (43 minutes downtime allowed)
- **Read Latency**: p95 ≤ 250ms
- **Write Latency**: p95 ≤ 400ms
- **Error Budget**: 0.1% (0.001 error rate)

## Testing

### Unit Tests

- `RequestLoggingFilterTests`: Validates structured logging format
- `MetricsEndpointTests`: Verifies metrics endpoint availability

### Manual Verification

```bash
# Start the application
./gradlew bootRun

# Check health
curl http://localhost:8080/actuator/health

# Check available metrics
curl http://localhost:8080/actuator/metrics

# Check specific metric
curl http://localhost:8080/actuator/metrics/http.server.requests

# Check Prometheus format
curl http://localhost:8080/actuator/prometheus

# Make a request with custom request ID
curl -H "X-Request-ID: test-123" http://localhost:8080/api/cart

# Verify logs include the request ID
grep "test-123" logs/application.log
```

## Production Configuration

Set environment variables:
- `SPRING_PROFILES_ACTIVE=production`
- `JDBC_DATABASE_URL`: Database connection string
- `JDBC_DATABASE_USERNAME`: Database username
- `JDBC_DATABASE_PASSWORD`: Database password

In production profile:
- Log level set to INFO (reduces verbosity)
- OAuth2 JWT authentication enabled
- MySQL session schema used

## Troubleshooting

### High Latency
1. Check `http.server.requests` percentiles
2. Identify slow endpoints from tags
3. Review database query performance
4. Check external dependency timeouts

### High Error Rate
1. Check logs for error patterns
2. Review `http.server.requests` by status code
3. Verify API contract compliance
4. Check for validation errors

### Memory Issues
1. Monitor `jvm.memory.used` / `jvm.memory.max` ratio
2. Check for memory leaks with heap dump
3. Review GC pause times: `jvm.gc.pause`
4. Analyze object retention

### Authentication Failures
1. Review security event logs
2. Check for credential issues
3. Verify OAuth2 configuration in production
4. Monitor for brute force attacks
