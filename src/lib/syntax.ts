// JXL Tree Syntax definitions

export const HEADER_KEYWORDS = [
  'Bitdepth',
  'Width',
  'Height',
  'RCT',
  'Orientation',
  'Alpha',
  'NotLast',
  'FramePos',
  'XYB',
  'XYBFactors',
  'Gaborish',
  'EPF',
  '16BitBuffers',
  'Squeeze',
  'CbYCr',
] as const;

export const PROPERTIES = [
  'c',      // channel (0=R, 1=G, 2=B, 3=A)
  'g',      // group number
  'x',      // x coordinate
  'y',      // y coordinate
  'N',      // north (above)
  'W',      // west (left)
  '|N|',    // absolute north
  '|W|',    // absolute west
  'NW',     // northwest
  'NE',     // northeast
  'NN',     // north-north
  'WW',     // west-west
  'W-WW-NW+NWW',
  'W+N-NW',
  'W-NW',
  'NW-N',
  'N-NE',
  'N-NN',
  'W-WW',
  'WGH',    // weighted predictor error
  'Prev',   // previous channel value
  'PPrev',  // channel before previous
  'PrevErr',
  'PPrevErr',
  'PrevAbs',
  'PPrevAbs',
  'PrevAbsErr',
  'PPrevAbsErr',
] as const;

export const PREDICTORS = [
  'Set',      // set to offset value
  'W',        // west
  'N',        // north
  'NW',       // northwest
  'NE',       // northeast
  'WW',       // west-west
  'Select',   // WebP predictor
  'Gradient', // W+N-NW clamped
  'Weighted', // weighted sum
  'AvgW+N',   // average
  'AvgW+NW',
  'AvgN+NW',
  'AvgN+NE',
  'AvgAll',   // weighted sum of many
] as const;

export const KEYWORDS = ['if'] as const;

export type HeaderKeyword = typeof HEADER_KEYWORDS[number];
export type Property = typeof PROPERTIES[number];
export type Predictor = typeof PREDICTORS[number];

// Token types for syntax highlighting
export type TokenType = 
  | 'keyword'     // if
  | 'header'      // Bitdepth, Width, etc
  | 'property'    // c, x, y, N, W, etc
  | 'predictor'   // Set, Gradient, Weighted, etc
  | 'operator'    // >, +, -
  | 'number'      // 123, -45
  | 'leaf'        // - (leaf marker)
  | 'comment'     // # comment
  | 'error'       // unknown token
  | 'default';

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

// Tokenize a line
export function tokenizeLine(line: string, lineStart: number = 0): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < line.length) {
    const start = lineStart + i;
    
    // Skip whitespace
    if (/\s/.test(line[i])) {
      i++;
      continue;
    }
    
    // Comment
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i), start, end: lineStart + line.length });
      break;
    }
    
    // Leaf marker
    if (line[i] === '-' && (i === 0 || /\s/.test(line[i-1]))) {
      const next = line.slice(i+1).match(/^\s*(\w+)/);
      if (next && PREDICTORS.includes(next[1] as Predictor)) {
        tokens.push({ type: 'leaf', value: '-', start, end: start + 1 });
        i++;
        continue;
      }
    }
    
    // Operators
    if (line[i] === '>') {
      tokens.push({ type: 'operator', value: '>', start, end: start + 1 });
      i++;
      continue;
    }
    
    // Special case: 16BitBuffers (starts with number but is a keyword)
    if (line.slice(i).startsWith('16BitBuffers')) {
      tokens.push({ type: 'header', value: '16BitBuffers', start, end: start + 12 });
      i += 12;
      continue;
    }
    
    // Numbers (including negative and with +/- prefix)
    if (/[+\-]?\d/.test(line.slice(i, i+2)) || /\d/.test(line[i])) {
      const match = line.slice(i).match(/^[+\-]?\d+/);
      if (match) {
        tokens.push({ type: 'number', value: match[0], start, end: start + match[0].length });
        i += match[0].length;
        continue;
      }
    }
    
    // Words (identifiers)
    const wordMatch = line.slice(i).match(/^[\w+\-|]+/);
    if (wordMatch) {
      const word = wordMatch[0];
      let type: TokenType = 'default';
      
      if (word === 'if') {
        type = 'keyword';
      } else if (HEADER_KEYWORDS.includes(word as HeaderKeyword)) {
        type = 'header';
      } else if (PREDICTORS.includes(word as Predictor)) {
        type = 'predictor';
      } else if (PROPERTIES.includes(word as Property)) {
        type = 'property';
      } else if (/^[+\-]\d+$/.test(word)) {
        type = 'number';
      } else {
        type = 'error';
      }
      
      tokens.push({ type, value: word, start, end: start + word.length });
      i += word.length;
      continue;
    }
    
    // Unknown character
    tokens.push({ type: 'error', value: line[i], start, end: start + 1 });
    i++;
  }
  
  return tokens;
}

// Get autocomplete suggestions based on context
export function getCompletions(line: string, cursorPos: number): string[] {
  const beforeCursor = line.slice(0, cursorPos);
  const words = beforeCursor.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  const prevWord = words[words.length - 2] || '';
  
  // After 'if' -> suggest properties
  if (prevWord === 'if') {
    return PROPERTIES.filter(p => p.toLowerCase().startsWith(lastWord.toLowerCase()));
  }
  
  // After '-' -> suggest predictors
  if (prevWord === '-' || beforeCursor.trimEnd().endsWith('-')) {
    const search = prevWord === '-' ? lastWord : '';
    return PREDICTORS.filter(p => p.toLowerCase().startsWith(search.toLowerCase()));
  }
  
  // After property and '>' -> suggest nothing (number expected)
  if (prevWord === '>') {
    return [];
  }
  
  // Start of line or after indent -> suggest keywords/headers
  if (beforeCursor.trim() === '' || beforeCursor.trim() === lastWord) {
    const all = [...KEYWORDS, ...HEADER_KEYWORDS, '-'];
    return all.filter(k => k.toLowerCase().startsWith(lastWord.toLowerCase()));
  }
  
  // Default: all options
  const all = [...KEYWORDS, ...HEADER_KEYWORDS, ...PROPERTIES, ...PREDICTORS];
  return all.filter(k => k.toLowerCase().startsWith(lastWord.toLowerCase()));
}

// Convert tokens to highlighted HTML
export function highlightLine(line: string): string {
  const tokens = tokenizeLine(line, 0);
  if (tokens.length === 0) return escapeHtml(line);
  
  let html = '';
  let lastEnd = 0;
  
  for (const token of tokens) {
    // Add any whitespace before this token
    if (token.start > lastEnd) {
      html += escapeHtml(line.slice(lastEnd, token.start));
    }
    
    html += `<span class="tok-${token.type}">${escapeHtml(token.value)}</span>`;
    lastEnd = token.end;
  }
  
  // Add any remaining content
  if (lastEnd < line.length) {
    html += escapeHtml(line.slice(lastEnd));
  }
  
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Highlight entire code
export function highlightCode(code: string): string {
  return code.split('\n').map(highlightLine).join('\n');
}
