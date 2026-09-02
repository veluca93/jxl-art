import pako from 'pako';

// Encode code to URL-safe base64
export function encodeForUrl(code: string): string {
  const compressed = pako.deflate(new TextEncoder().encode(code));
  const base64 = btoa(String.fromCharCode(...compressed));
  // Make URL-safe: + -> -, / -> _, remove =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decode from URL-safe base64
export function decodeFromUrl(encoded: string): string {
  // Restore standard base64
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decompressed = pako.inflate(bytes);
  return new TextDecoder().decode(decompressed);
}

// Get code from URL if present
export function getCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  
  // Try compressed format first
  const zcode = params.get('zcode');
  if (zcode) {
    try {
      return decodeFromUrl(zcode);
    } catch (e) {
      console.error('Failed to decode zcode:', e);
    }
  }
  
  // Try legacy uncompressed format
  const code = params.get('code');
  if (code) {
    try {
      const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
      return atob(base64);
    } catch (e) {
      console.error('Failed to decode code:', e);
    }
  }
  
  return null;
}

// Update URL with code
export function updateUrlWithCode(code: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.set('zcode', encodeForUrl(code));
  window.history.replaceState({}, '', url.toString());
}

// Copy share URL to clipboard
export async function copyShareUrl(code: string): Promise<void> {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.set('zcode', encodeForUrl(code));
  await navigator.clipboard.writeText(url.toString());
}
