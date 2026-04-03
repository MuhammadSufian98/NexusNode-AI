import { spawn } from "node:child_process";

const appEnv = (
  process.env.APP_ENV ||
  process.env.NODE_ENV ||
  "development"
).toLowerCase();

const isProduction = appEnv === "production";
const command = isProduction ? "node" : "npx";
const args = isProduction ? ["./server.js"] : ["nodemon", "./server.js"];

console.log(
  `[BOOT] APP_ENV=${appEnv} | mode=${isProduction ? "production" : "development"} | runner=${isProduction ? "node" : "nodemon"}`,
);

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
