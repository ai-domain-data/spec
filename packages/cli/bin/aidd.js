#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const schemaFile = path.resolve(repoRoot, "spec", "schema-v0.1.json");

async function loadSchema() {
  const contents = await fs.readFile(schemaFile, "utf-8");
  return JSON.parse(contents);
}

function parseArgs(argv) {
  const args = argv.slice(3);
  const options = {};
  args.forEach((arg) => {
    if (arg.startsWith("--path=")) {
      options.path = arg.replace("--path=", "");
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "-p") {
      const index = args.indexOf(arg);
      const value = args[index + 1];
      if (value) {
        options.path = value;
      }
    }
  });
  return options;
}

function resolveTargetPath(customPath) {
  return path.resolve(process.cwd(), customPath ?? "domain-profile.json");
}

function encodeBase64(input) {
  return Buffer.from(input, "utf-8").toString("base64");
}

function chunkString(value, size) {
  const chunks = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

function formatDnsRecord(base64String, domain = "example.com") {
  const chunks = chunkString(base64String, 255);
  if (!chunks.length) {
    return `_ai.${domain} TXT ("ai-json=")`;
  }

  const [first, ...rest] = chunks;
  const segments = [`"ai-json=${first}"`, ...rest.map((chunk) => `"${chunk}"`)];
  return `_ai.${domain} TXT (${segments.join(" ")})`;
}

async function writeTemplate(targetPath, force = false) {
  try {
    await fs.access(targetPath);
    if (!force) {
      console.error(
        `✖ File already exists at ${targetPath}. Use --force to overwrite.`
      );
      process.exit(1);
    }
  } catch {
    // file does not exist, continue
  }

  const template = {
    spec: "https://ai-domain-data.org/spec/v0.1",
    name: "Your Site or Organization",
    description: "Concise description of what your domain provides.",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  await fs.writeFile(targetPath, `${JSON.stringify(template, null, 2)}\n`, "utf-8");
  console.log(`✔ Created ${targetPath}. Update the placeholder values before publishing.`);
}

async function loadRecord(targetPath) {
  try {
    const contents = await fs.readFile(targetPath, "utf-8");
    return JSON.parse(contents);
  } catch (error) {
    console.error(`✖ Unable to read or parse ${targetPath}: ${(error).message}`);
    process.exit(1);
  }
}

async function createValidator() {
  const schema = await loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

async function validateRecord(record, validator) {
  const valid = validator(record);
  if (valid) {
    return { valid: true, errors: [] };
  }
  const errors =
    validator.errors?.map((issue) => {
      if (issue.instancePath) {
        return `${issue.instancePath} ${issue.message}`;
      }
      return issue.message ?? "Unknown validation error";
    }) ?? [];
  return { valid: false, errors };
}

async function handleValidate(targetPath) {
  const record = await loadRecord(targetPath);
  const validate = await createValidator();
  const result = await validateRecord(record, validate);

  if (result.valid) {
    console.log(`✔ ${targetPath} is valid for AI Domain Data v0.1.`);
    process.exit(0);
  }

  console.error(`✖ ${targetPath} is not valid:`);
  result.errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

async function handleEmit(targetPath) {
  const record = await loadRecord(targetPath);
  const validate = await createValidator();
  const result = await validateRecord(record, validate);

  if (!result.valid) {
    console.error(`✖ ${targetPath} failed validation. Resolve the issues below:`);
    result.errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  const prettyJson = JSON.stringify(record, null, 2);
  const compact = JSON.stringify(record);
  const base64Payload = encodeBase64(compact);
  const dnsRecord = formatDnsRecord(base64Payload);

  console.log("Save this JSON as https://<domain>/.well-known/domain-profile.json");
  console.log("=== /.well-known/domain-profile.json ===");
  console.log(prettyJson);
  console.log("\nOptionally mirror the same payload via DNS:");
  console.log(`- Create _ai.<domain> TXT with ai-json=<base64(JSON)>`);
  console.log("=== _ai.<domain> TXT value ===");
  console.log(dnsRecord);
}

function printHelp() {
  console.log(`aidd - AI Domain Data CLI v0.1

Usage:
  aidd init [--path=./domain-profile.json] [--force]
  aidd validate [--path=./domain-profile.json]
  aidd emit [--path=./domain-profile.json]

Commands:
  init      Create a starter domain-profile.json file with placeholder values.
  validate  Validate domain-profile.json against the v0.1 schema. Exit code 0 on success.
  emit      Validate then print the JSON for /.well-known/domain-profile.json and the DNS TXT payload.

Options:
  --path, -p   Path to the domain-profile.json file (default: ./domain-profile.json)
  --force      Overwrite the file when running init
  --help       Show this help message
`);
}

async function main() {
  const [, , command] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  const options = parseArgs(process.argv);
  const targetPath = resolveTargetPath(options.path);

  switch (command) {
    case "init":
      await writeTemplate(targetPath, options.force);
      break;
    case "validate":
      await handleValidate(targetPath);
      break;
    case "emit":
      await handleEmit(targetPath);
      break;
    default:
      console.error(`Unknown command "${command}".\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

