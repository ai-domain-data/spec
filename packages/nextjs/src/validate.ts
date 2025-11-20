import Ajv from "ajv";
import addFormats from "ajv-formats";
import { AIDD_SCHEMA } from "./schema.js";
import type { AIDomainDataPayload, ValidationResult } from "./types.js";

const ajv = new Ajv.default({ allErrors: true, validateSchema: false });
addFormats.default(ajv);

const validate = ajv.compile(AIDD_SCHEMA);

export function validateAIDomainData(
  data: unknown
): ValidationResult {
  const isValid = validate(data);
  
  if (isValid) {
    return { valid: true, errors: [] };
  }
  
  const errors = validate.errors?.map((err: any) => {
    const path = err.instancePath || err.schemaPath;
    return `${path}: ${err.message}`;
  }) || [];
  
  return { valid: false, errors };
}

export function assertValidAIDomainData(
  data: unknown
): asserts data is AIDomainDataPayload {
  const result = validateAIDomainData(data);
  if (!result.valid) {
    throw new Error(
      `Invalid AI Domain Data: ${result.errors.join(", ")}`
    );
  }
}

