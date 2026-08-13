import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,

} from "node:crypto";

import { cookies } from "next/headers";

import {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/admin-auth-constants";

export {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      name + " is not configured."
    );
  }

  return value;
}

function hashPassword(
  password: string,
  salt: string
) {
  return scryptSync(
    password,
    salt,
    64
  ).toString("hex");
}

function verifyPassword(password: string) {
  const storedHash = getRequiredEnv(
    "ADMIN_PASSWORD_HASH"
  );

  const salt = getRequiredEnv(
    "ADMIN_PASSWORD_SALT"
  );

  const calculatedHash = hashPassword(
    password,
    salt
  );

  const stored = Buffer.from(
    storedHash,
    "hex"
  );

  const calculated = Buffer.from(
    calculatedHash,
    "hex"
  );

  if (stored.length !== calculated.length) {
    return false;
  }

  return timingSafeEqual(
    stored,
    calculated
  );
}

function sign(payload: string) {
  const secret = getRequiredEnv(
    "ADMIN_SESSION_SECRET"
  );

  return createHmac(
    "sha256",
    secret
  )
    .update(payload)
    .digest("hex");
}

export function verifyAdminCredentials(
  username: string,
  password: string
) {
  const adminUsername = getRequiredEnv(
    "ADMIN_USERNAME"
  );

  return (
    username === adminUsername &&
    verifyPassword(password)
  );
}

export function createAdminSession() {
  const expiresAt =
    Math.floor(Date.now() / 1000) +
    SESSION_TTL_SECONDS;

  const nonce = randomBytes(16).toString(
    "hex"
  );

  const payload =
    String(expiresAt) + "." + nonce;

  const signature = sign(payload);

  return (
    payload +
    "." +
    signature
  );
}

export function verifyAdminSession(
  token: string | undefined
) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const expiresAtText = parts[0];
  const nonce = parts[1];
  const signature = parts[2];

  const expiresAt = Number(
    expiresAtText
  );

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (
    expiresAt <=
    Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  if (!nonce || !signature) {
    return false;
  }

  const payload =
    expiresAtText + "." + nonce;

  const expectedSignature =
    sign(payload);

  const actual = Buffer.from(
    signature,
    "hex"
  );

  const expected = Buffer.from(
    expectedSignature,
    "hex"
  );

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(
    actual,
    expected
  );
}

export async function requireAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    COOKIE_NAME
  )?.value;

  return verifyAdminSession(token);
}