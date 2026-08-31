import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.scryptSync(
      process.env.JWT_SECRET || "nexus-default-vault-secret",
      "nexusSalt",
      32,
    );

export const encryptSecret = (plainText) => {
  if (!plainText) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptSecret = (encryptedPayload) => {
  if (!encryptedPayload) return null;
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return null;

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      SECRET_KEY,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Vault decryption failed:", err.message);
    return null;
  }
};

export const maskSecret = (key) => {
  if (!key || key.length < 8) return "••••••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
};
