import { spawn } from "node:child_process";
import { apiClient } from "@japa/api-client";
import { expect } from "@japa/expect";
import { configure, processCLIArgs, run } from "@japa/runner";

processCLIArgs(process.argv.splice(2));
configure({
  suites: [
    {
      name: "e2e",
      files: ["**/tests/e2e/**/*.spec.ts"],
      configure: (suite) => {
        suite.setup(async () => {
          const encore = spawn("encore", ["run"], {
            detached: true,
            stdio: "pipe",
          });

          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });

          return () => {
            encore.kill();
          };
        });
      },
    },
  ],
  plugins: [expect(), apiClient("http://localhost:4000")],
});

run();
