/// <reference types="next" />

declare module "next/server" {
  export class NextResponse<T = any> {
    static json<T>(data: T, init?: ResponseInit): NextResponse<T>;
    constructor(body?: BodyInit | null, init?: ResponseInit);
  }
}

declare module "next" {
  import { IncomingMessage, ServerResponse } from "http";
  
  export interface NextApiRequest extends IncomingMessage {
    method?: string;
  }
  
  export interface NextApiResponse<T = any> extends ServerResponse {
    status(code: number): NextApiResponse<T>;
    json(data: T): NextApiResponse<T>;
    setHeader(name: string, value: string | string[]): void;
    end(chunk?: any): void;
  }
}

