const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
const outPath = path.join(projectRoot, "js", "env.js");

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env file. Create it first.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const env = parseEnv(raw);

let abi = [];
if (env.CONTRACT_ABI_JSON) {
  try {
    abi = JSON.parse(env.CONTRACT_ABI_JSON);
  } catch (error) {
    console.error("CONTRACT_ABI_JSON must be valid JSON array.");
    process.exit(1);
  }
}

const clientConfig = {
  PINATA_API_KEY: env.PINATA_API_KEY || "",
  PINATA_SECRET_API_KEY: env.PINATA_SECRET_API_KEY || "",
  CONTRACT_ADDRESS: env.CONTRACT_ADDRESS || "",
  CONTRACT_ABI: abi,
};

const fileContent = `window.APP_CONFIG = ${JSON.stringify(clientConfig, null, 2)};\n`;

fs.writeFileSync(outPath, fileContent, "utf8");
console.log("Generated js/env.js from .env");
