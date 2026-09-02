export interface RenderResult {
  jxlData: Uint8Array;
  pngData: Uint8Array;
}

export interface RenderOptions {
  skipPng?: boolean;
}

export interface WorkerApi {
  render(code: string, options?: RenderOptions): Promise<RenderResult>;
  prettier(code: string): string;
}
