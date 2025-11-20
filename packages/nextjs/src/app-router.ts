import { NextResponse } from "next/server";
import type { AIDomainDataConfig, AIDomainDataPayload } from "./types.js";
import { generateAIDomainData, generateAIDomainDataFromEnv } from "./generate.js";

export interface AIDomainDataRouteOptions {
  config?: AIDomainDataConfig;
  useEnv?: boolean;
  cacheMaxAge?: number;
}

export function createAIDomainDataRoute(
  options: AIDomainDataRouteOptions = {}
): () => Promise<NextResponse<AIDomainDataPayload>> {
  return async function GET() {
    let payload: AIDomainDataPayload;
    
    if (options.config) {
      payload = generateAIDomainData(options.config);
    } else if (options.useEnv !== false) {
      payload = generateAIDomainDataFromEnv();
    } else {
      throw new Error(
        "Either config or useEnv must be provided to createAIDomainDataRoute"
      );
    }
    
    const maxAge = options.cacheMaxAge ?? 3600;
    
    return NextResponse.json(payload, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      },
    });
  };
}

export async function getAIDomainDataResponse(
  options: AIDomainDataRouteOptions = {}
): Promise<NextResponse<AIDomainDataPayload>> {
  const route = createAIDomainDataRoute(options);
  return route();
}

