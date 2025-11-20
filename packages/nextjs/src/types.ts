export interface AIDomainDataConfig {
  name: string;
  description: string;
  website: string;
  contact: string;
  logo?: string;
  entity_type?: "Organization" | "Person" | "Blog" | "NGO" | "Community" | "Project" | "CreativeWork" | "SoftwareApplication" | "Thing";
  jsonld?: Record<string, unknown>;
}

export interface AIDomainDataPayload {
  spec: "https://ai-domain-data.org/spec/v0.1";
  name: string;
  description: string;
  website: string;
  contact: string;
  logo?: string;
  entity_type?: string;
  jsonld?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

