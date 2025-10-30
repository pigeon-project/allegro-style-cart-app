# Allegro-Style Cart Application

A shopping cart application with rate limiting and security hardening.

## Getting Started

### Building the Project

```bash
./gradlew build
```

### Running Tests

```bash
./gradlew test
```

### Running the Application

```bash
./gradlew bootRun
```

The application will start on `http://localhost:8080`.

Default credentials:
- Username: `admin`
- Password: `password`

## Features

### Rate Limiting

The application implements per-user rate limiting:
- **Default limit**: 60 requests per minute per user
- **Rate limit headers** included in all responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- **HTTP 429** returned when limit exceeded with `Retry-After` header

#### Testing Rate Limiting

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

You should see:
- First 60 requests return HTTP 200 with decreasing `X-RateLimit-Remaining`
- Requests 61+ return HTTP 429 with `Retry-After` header

#### Configuration

Rate limiting can be configured in `application.yaml`:

```yaml
rate-limit:
  enabled: true
  requests-per-minute: 60
```

### Input Validation

All text inputs are:
- Trimmed of whitespace
- Normalized to NFC Unicode form
- Validated against allowlists to prevent injection attacks

Product titles accept: letters, numbers, spaces, and common punctuation.

## Documentation

- [SPEC.md](spec/SPEC.md) - Full application specification
- [SHARED-NFR.md](spec/SHARED-NFR.md) - Organization-wide non-functional requirements

### Reference Documentation
For further reference, please consider the following sections:

* [Official Gradle documentation](https://docs.gradle.org)
* [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/3.5.5/gradle-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.5.5/gradle-plugin/packaging-oci-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/3.5.5/reference/web/servlet.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)

### Additional Links
These additional references should also help you:

* [Gradle Build Scans – insights for your project's build](https://scans.gradle.com#gradle)
