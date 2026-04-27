const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
const outPath = path.join(projectRoot, "js", "env.js");

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const result = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    // Support multiline ABI blocks pasted from Remix in .env.
    if (key === "CONTRACT_ABI_JSON") {
      let abiValue = value;
      let parsed = false;

      try {
        JSON.parse(abiValue);
        parsed = true;
      } catch {
        // Keep collecting lines until JSON parses or a new KEY= line starts.
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();

          if (/^[A-Z_][A-Z0-9_]*\s*=/.test(nextTrimmed)) {
            break;
          }

          abiValue += `\n${lines[j]}`;
          try {
            JSON.parse(abiValue);
            parsed = true;
            i = j;
            break;
          } catch {
            // keep appending lines until it becomes valid JSON
          }
        }
      }

      result[key] = parsed ? abiValue : value;
      continue;
    }

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
  const envFromProcess = {
    PINATA_API_KEY: process.env.PINATA_API_KEY || "",
    PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY || "",
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
    CONTRACT_ABI_JSON: process.env.CONTRACT_ABI_JSON || "[]",
  };

  let abi = [];
  if (envFromProcess.CONTRACT_ABI_JSON) {
    try {
      abi = JSON.parse(envFromProcess.CONTRACT_ABI_JSON);
    } catch (error) {
      console.error("CONTRACT_ABI_JSON must be valid JSON array.");
      process.exit(1);
    }
  }

  const clientConfig = {
    PINATA_API_KEY: envFromProcess.PINATA_API_KEY,
    PINATA_SECRET_API_KEY: envFromProcess.PINATA_SECRET_API_KEY,
    CONTRACT_ADDRESS: envFromProcess.CONTRACT_ADDRESS,
    CONTRACT_ABI: abi,
  };

  const fileContent = `window.APP_CONFIG = ${JSON.stringify(clientConfig, null, 2)};\n`;
  fs.writeFileSync(outPath, fileContent, "utf8");
  console.log("Generated js/env.js from process environment");
  process.exit(0);
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
