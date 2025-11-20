import type { NextApiRequest, NextApiResponse } from "next";
import type { AIDomainDataConfig, AIDomainDataPayload } from "./types.js";
import { generateAIDomainData, generateAIDomainDataFromEnv } from "./generate.js";

export interface AIDomainDataHandlerOptions {
  config?: AIDomainDataConfig;
  useEnv?: boolean;
  cacheMaxAge?: number;
}

export function createAIDomainDataHandler(
  options: AIDomainDataHandlerOptions = {}
) {
  return function handler(
    req: NextApiRequest,
    res: NextApiResponse<AIDomainDataPayload>
  ) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      res.status(405).end();
      return;
    }
    
    let payload: AIDomainDataPayload;
    
    try {
      if (options.config) {
        payload = generateAIDomainData(options.config);
      } else if (options.useEnv !== false) {
        payload = generateAIDomainDataFromEnv();
      } else {
        res.status(500).json({
          error: "Either config or useEnv must be provided",
        } as unknown as AIDomainDataPayload);
        return;
      }
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      } as unknown as AIDomainDataPayload);
      return;
    }
    
    const maxAge = options.cacheMaxAge ?? 3600;
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge}`);
    res.status(200).json(payload);
  };
}

