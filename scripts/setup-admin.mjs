import {
  randomBytes,
  scryptSync,
} from "node:crypto";
import fs from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({
  input,
  output,
});

const usernameInput = await rl.question(
  "Admin username [admin]: "
);

const password = await rl.question(
  "Admin password: ",
  {
    hideEchoBack: true,
  }
);

rl.close();

const username =
  usernameInput.trim() || "admin";

if (!password) {
  console.error("Password cannot be empty.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");

const hash = scryptSync(
  password,
  salt,
  64
).toString("hex");

const sessionSecret = randomBytes(48).toString(
  "hex"
);

const envPath = ".env";

const existing = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, "utf8")
  : "";

const lines = existing
  .split(/\r?\n/)
  .filter(Boolean)
  .filter(
    (line) =>
      !line.startsWith("ADMIN_USERNAME=") &&
      !line.startsWith("ADMIN_PASSWORD_SALT=") &&
      !line.startsWith("ADMIN_PASSWORD_HASH=") &&
      !line.startsWith("ADMIN_SESSION_SECRET=")
  );

lines.push(
  `ADMIN_USERNAME=${username}`,
  `ADMIN_PASSWORD_SALT=${salt}`,
  `ADMIN_PASSWORD_HASH=${hash}`,
  `ADMIN_SESSION_SECRET=${sessionSecret}`
);

fs.writeFileSync(
  envPath,
  lines.join("\n") + "\n",
  "utf8"
);

console.log("");
console.log("Admin credentials configured.");
console.log("Username:", username);
console.log("Hash length:", hash.length);
console.log("Salt length:", salt.length);