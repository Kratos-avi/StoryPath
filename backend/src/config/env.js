const requiredInAll = ["DATABASE_URL"];
const requiredInProd = ["JWT_SECRET"];

function missingKeys(keys) {
  return keys.filter((key) => !process.env[key] || !String(process.env[key]).trim());
}

function validateEnv() {
  const missing = [...missingKeys(requiredInAll)];

  if (process.env.NODE_ENV === "production") {
    missing.push(...missingKeys(requiredInProd));
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(", ")}`);
  }

  if (process.env.NODE_ENV !== "production" && !process.env.JWT_SECRET) {
    console.warn("[env] JWT_SECRET is not set. Using development fallback secret.");
  }

  if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_ORIGIN) {
    console.warn("[env] FRONTEND_ORIGIN is not set. Falling back to Render/local allowed origins.");
  }
}

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  return "dev_secret_change_me";
}

function getAllowedOrigins() {
  if (!process.env.FRONTEND_ORIGIN) {
    const fallback = ["http://localhost:5173"];

    if (process.env.RENDER_EXTERNAL_URL) {
      fallback.push(process.env.RENDER_EXTERNAL_URL);
    }

    return fallback;
  }

  return process.env.FRONTEND_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  validateEnv,
  getJwtSecret,
  getAllowedOrigins,
};
