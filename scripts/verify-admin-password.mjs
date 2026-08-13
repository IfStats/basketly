import {
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const username = process.env.ADMIN_USERNAME;
const storedHash = process.env.ADMIN_PASSWORD_HASH;
const salt = process.env.ADMIN_PASSWORD_SALT;

if (!username || !storedHash || !salt) {
  console.log("Missing one or more admin environment variables.");
  process.exit(1);
}

console.log("ADMIN_USERNAME:", username);
console.log(
  "ADMIN_PASSWORD_HASH:",
  storedHash ? "present" : "missing"
);
console.log(
  "ADMIN_PASSWORD_SALT:",
  salt ? "present" : "missing"
);

const rl = readline.createInterface({
  input,
  output,
});

const password = await rl.question(
  "Enter the admin password to test: ",
  {
    hideEchoBack: true,
  }
);

rl.close();

const calculated = scryptSync(
  password,
  salt,
  64
);

const stored = Buffer.from(
  storedHash,
  "hex"
);

console.log(
  "Password match:",
  stored.length === calculated.length &&
    timingSafeEqual(stored, calculated)
);