import { get, set } from 'idb-keyval';

const CODE_KEY = 'jxl-art-code';

export async function saveCode(code: string): Promise<void> {
  await set(CODE_KEY, code);
}

export async function loadCode(): Promise<string | undefined> {
  return get(CODE_KEY);
}
