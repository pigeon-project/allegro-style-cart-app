Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected
information that does not match the info here.

## General Rules

- Make sure to create a Dockerfile to run the app easily in a container.
- If the repository does not have a `SPEC.md` file in the `/spec` directory, create one.
- Always make sure to update `SPEC.md` in the `spec` directory when implementing new features or changing project assumptions or infrastructure decisions.

## Frontend Development Rules

- Always prefer **named functions** over `const` with arrow functions.
- Always prefer **default export on named function components**.
- Test coverage is a must, use provided `react-testing-library` and `vitest`.
- In tests, prefer **`userEvent` over `fireEvent`**.
- **Avoid `useEffect`** whenever possible.
- Use **React Query** with optimistic updates.
- Use vite proxy feature for local frontned development
- Make Tailwind UI look **professional, coherent, and support dark mode**.
- **Avoid unnecessary dependencies**.
- If dependencies are required, **prioritize favorites**:
    - `react-use`
    - `dayjs`
    - `tanstack router` (file-based routing)
    - `react-spring`
    - `tabler-icons`
    - `react-hook-form`
    - `zod`
- local user and password that you can use are: admin:password
- make sure to add e2e tests for new functionalities, run them via `npx playwright test`
- regenerate api-types.ts by running `npm run generate-types` in `/frontend` directory

## Backend Development Rules

- Use the **latest Java**.
- **Avoid modifying Gradle files**.
- When creating repositories, **split into two**: domain and actual DB.
- Prefer **`@Configuration`** over `@Component` and `@Service`.
- Use **configuration properties**.
- Use **SpringDoc OpenAPI**.
- **Layout projects by features** with exposed facades.
- **Limit package visibility** — only make public what’s necessary.
- Prefer **Records**.
- Prefer **Virtual Threads**.
- Test coverage is a must, use provided `junit` platform.
- When writing tests use the MockMvc approach, avoid WireMock.
- For local development use h2 in-memory database but for production I'll use different JDBC database.
- If functionality is needed, use existing spring-boot-starters, do not implement your own solutions
  (like spring-security)
- When using spring-session - scripts for most major database vendors are packaged as
  org/springframework/session/jdbc/schema-*.sql so i.e., to use mysql set
  `spring.session.jdbc.schema=classpath:org/springframework/session/jdbc/schema-mysql.sql`
- Update archiunit tests if new architecture pattern in code layout will is needed
- `issues` package is an example pacakge that can be used as a template for new modules, can be safely deleted
