import { expose } from 'comlink';
import type { RenderResult, RenderOptions, WorkerApi } from '../lib/types';
import { prettifyTree } from '../lib/prettier';

let module: any = null;
let lastError: string[] = [];

async function initModule() {
  if (module) return;
  
  const createModule = (await import('../../wasm/libjxl/jxl.js')).default;
  
  module = await createModule({
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return new URL('../../wasm/libjxl/jxl.wasm', import.meta.url).href;
      }
      return path;
    },
    // Capture stderr from libjxl for error messages
    printErr: (text: string) => {
      console.error('[libjxl]', text);
      lastError.push(text);
    },
    print: (text: string) => {
      console.log('[libjxl]', text);
    }
  });
  
  console.log('[Worker] libjxl loaded');
}

const workerApi: WorkerApi = {
  async render(code: string, options?: RenderOptions): Promise<RenderResult> {
    await initModule();
    
    // Clear previous errors
    lastError = [];
    
    // Force PNG rendering if 16BitBuffers is used (browsers can't display natively)
    const uses16Bit = /^\s*16BitBuffers\b/im.test(code);
    const skipPng = uses16Bit ? false : (options?.skipPng ?? false);
    
    // Encode tree to JXL
    let jxlResult;
    try {
      jxlResult = module.jxl_from_tree(code);
    } catch (e: unknown) {
      const stderr = lastError.join('\n');
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(stderr || `Encode failed: ${msg}`);
    }
    
    // Check for errors captured from stderr
    if (lastError.length > 0) {
      const stderr = lastError.join('\n');
      // Filter out non-error messages if needed
      if (stderr.toLowerCase().includes('error') || stderr.toLowerCase().includes('fail')) {
        throw new Error(stderr);
      }
    }
    
    if (typeof jxlResult === 'string') {
      // libjxl returns error message as string
      throw new Error(jxlResult);
    }
    if (!jxlResult || jxlResult.length === 0) {
      const stderr = lastError.join('\n');
      throw new Error(stderr || 'Compilation failed - check your tree syntax');
    }
    const jxlData = new Uint8Array(jxlResult);
    
    // Skip PNG decoding if native JXL is supported
    if (skipPng) {
      return { jxlData, pngData: new Uint8Array(0) };
    }
    
    // Decode JXL to PNG
    lastError = [];
    let pngResult;
    try {
      pngResult = module.decode(jxlData);
    } catch (e: unknown) {
      const stderr = lastError.join('\n');
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(stderr || `Decode failed: ${msg}`);
    }
    
    if (!pngResult || pngResult.length === 0) {
      const stderr = lastError.join('\n');
      throw new Error(stderr || 'Failed to decode JXL to PNG');
    }
    const pngData = new Uint8Array(pngResult);

    return { jxlData, pngData };
  },

  prettier(code: string): string {
    return prettifyTree(code);
  }
};

expose(workerApi);
