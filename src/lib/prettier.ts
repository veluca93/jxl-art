// Tree code formatter/prettifier

const ZERO_ARGS_HEADER = ['squeeze', 'xyb', 'cbycr', 'alpha', 'notlast', '16bitbuffers', 'gaborish'];
const TWO_ARGS_HEADER = ['framepos'];
const THREE_ARGS_HEADER = ['xybfactors'];

function getNumHeaderArgs(name: string): number {
  const lower = name.toLowerCase();
  if (ZERO_ARGS_HEADER.includes(lower)) return 0;
  if (TWO_ARGS_HEADER.includes(lower)) return 2;
  if (THREE_ARGS_HEADER.includes(lower)) return 3;
  return 1;
}

function mustNext(it: Iterator<string>): string {
  const { value, done } = it.next();
  if (done) throw new Error('Unexpected end of input');
  return value;
}

export function prettifyTree(input: string): string {
  const tokens = input.split(/\s+/).filter(v => v);
  const it = tokens[Symbol.iterator]();
  return prettifyInner(it, 0);
}

function prettifyInner(it: Iterator<string>, depth: number): string {
  let result = '';
  let token: string;
  let done: boolean | undefined;
  let foundConfig = false;

  while (true) {
    ({ value: token, done } = it.next());
    if (done) return result;

    const lower = token.toLowerCase();
    if (lower === 'if' || token === '-') {
      if (foundConfig) result += '\n';
      break;
    }

    // Handle comments
    if (token.startsWith('/*')) {
      let endFound = token.endsWith('*/');
      result += `${'  '.repeat(depth)}${token}`;
      while (!endFound) {
        const next = mustNext(it);
        endFound = next.endsWith('*/');
        result += ` ${next}`;
      }
      result += '\n';
      continue;
    }

    // Header directives
    result += token;
    let numArgs = getNumHeaderArgs(lower);
    while (numArgs > 0) {
      result += ` ${mustNext(it)}`;
      numArgs--;
    }
    result += '\n';
    foundConfig = true;
  }

  if (token.toLowerCase() === 'if') {
    const prop = mustNext(it);
    mustNext(it); // skip '>'
    const val = mustNext(it);
    result += `${'  '.repeat(depth)}if ${prop} > ${val}\n`;
    result += prettifyInner(it, depth + 1);
    result += '\n';
    result += prettifyInner(it, depth + 1);
  } else if (token === '-') {
    const predictor = mustNext(it);
    const next = mustNext(it);
    result += `${'  '.repeat(depth)}- ${predictor}`;
    if (next === '+' || next === '-') {
      result += ` ${next} ${mustNext(it)}`;
    } else {
      result += ` ${next}`;
    }
  }

  if (depth === 0) {
    result += '\n';
    result += prettifyInner(it, 0);
  }

  return result;
}
