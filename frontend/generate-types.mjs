import { execSync, spawn } from "child_process";
import { setTimeout as wait } from "node:timers/promises";

const API_URL = "http://localhost:8080/v3/api-docs";

async function main() {
  console.log("🚀 Starting Java app via Gradle...");
  const gradle = spawn(".././gradlew", [":run", "-x", "test"], {
    stdio: "inherit",
  });

  function cleanup() {
    console.log("🧹 Stopping Java app...");
    gradle.kill("SIGTERM");
  }
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(1);
  });

  console.log("⏳ Waiting for Java app to start...");
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await wait(2000);
  }

  if (!ready) {
    console.error("❌ Java app did not start within timeout.");
    cleanup();
    process.exit(1);
  }

  console.log("✅ Java app is ready!");

  console.log("⚙️ Generating TypeScript API...");
  try {
    execSync(
      `npx --yes swagger-typescript-api generate -o ./src -n api-types.ts -p http://localhost:8080/v3/api-docs --no-client --sort-types`,
      { stdio: "inherit" },
    );
  } catch (err) {
    console.error("❌ Failed to generate API:", err.message);
    cleanup();
    process.exit(1);
  }

  console.log("✨ Generation complete!");
  cleanup();
  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
