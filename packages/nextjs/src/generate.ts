import type { AIDomainDataConfig, AIDomainDataPayload } from "./types.js";
import { validateAIDomainData } from "./validate.js";

export function generateAIDomainData(
  config: AIDomainDataConfig
): AIDomainDataPayload {
  const payload: AIDomainDataPayload = {
    spec: "https://ai-domain-data.org/spec/v0.1",
    name: config.name,
    description: config.description,
    website: config.website,
    contact: config.contact,
  };
  
  if (config.logo) {
    payload.logo = config.logo;
  }
  
  if (config.entity_type) {
    payload.entity_type = config.entity_type;
  }
  
  if (config.jsonld) {
    payload.jsonld = config.jsonld;
  }
  
  const validation = validateAIDomainData(payload);
  if (!validation.valid) {
    throw new Error(
      `Invalid AI Domain Data configuration: ${validation.errors.join(", ")}`
    );
  }
  
  return payload;
}

function getEnvVar(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      // Remove surrounding quotes if present and trim whitespace
      return value.trim().replace(/^["']|["']$/g, "");
    }
  }
  return "";
}

export function generateAIDomainDataFromEnv(): AIDomainDataPayload {
  const config: AIDomainDataConfig = {
    name: getEnvVar("NEXT_PUBLIC_SITE_NAME", "SITE_NAME"),
    description: getEnvVar("NEXT_PUBLIC_SITE_DESCRIPTION", "SITE_DESCRIPTION"),
    website: getEnvVar("NEXT_PUBLIC_SITE_URL", "SITE_URL"),
    contact: getEnvVar("NEXT_PUBLIC_SITE_CONTACT", "SITE_CONTACT"),
  };
  
  const logo = getEnvVar("NEXT_PUBLIC_SITE_LOGO", "SITE_LOGO");
  if (logo) {
    config.logo = logo;
  }
  
  const entityType = getEnvVar("NEXT_PUBLIC_ENTITY_TYPE", "ENTITY_TYPE");
  if (entityType) {
    const validTypes = [
      "Organization", "Person", "Blog", "NGO", "Community",
      "Project", "CreativeWork", "SoftwareApplication", "Thing"
    ];
    if (validTypes.includes(entityType)) {
      config.entity_type = entityType as AIDomainDataConfig["entity_type"];
    }
  }
  
  return generateAIDomainData(config);
}

