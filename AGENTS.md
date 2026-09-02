# JXL Art - Agent Instructions

## Project Overview

JXL Art is a web application for creating art using JPEG XL prediction trees. It uses libjxl compiled to WebAssembly.

## Tech Stack

- **Frontend**: Vite + TypeScript
- **WASM**: libjxl (C++) compiled with Emscripten
- **Styling**: Plain CSS (matte-black theme)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Build for GitHub Pages (/jxl-art base path)
npm run build:ghpages

# Preview production build
npm run preview
```

## Building WASM from Latest libjxl

The WASM module is pre-built in `wasm/libjxl/`. To rebuild from latest libjxl main:

### Prerequisites

1. Install Emscripten:
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source emsdk_env.sh
```

### Build

```bash
# Build from libjxl main branch (default)
npm run build:wasm

# Or specify a branch/tag
LIBJXL_BRANCH=v0.11.x npm run build:wasm
```

The build script (`scripts/build-libjxl.sh`):
1. Clones libjxl from GitHub
2. Configures with emcmake
3. Builds libjxl static libraries
4. Compiles our WASM wrapper with jxl_from_tree and decode functions

## Project Structure

```
jxl-art/
├── index.html              # Main HTML entry
├── src/
│   ├── main.ts            # App entry point
│   ├── styles.css         # All styles
│   ├── lib/
│   │   ├── types.ts       # TypeScript types
│   │   ├── prettier.ts    # Tree code formatter
│   │   ├── storage.ts     # IndexedDB persistence
│   │   ├── url.ts         # URL sharing utilities
│   │   └── help-content.ts # Help documentation
│   └── workers/
│       └── jxl-worker.ts  # Web Worker for WASM
├── wasm/
│   └── libjxl/
│       ├── jxl.js         # Emscripten glue code
│       └── jxl.wasm       # Compiled WASM
├── scripts/
│   └── build-libjxl.sh    # WASM build script
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Files to Modify

- **UI/Layout**: `index.html`, `src/styles.css`
- **App Logic**: `src/main.ts`
- **WASM Interface**: `src/workers/jxl-worker.ts`
- **Tree Syntax Help**: `src/lib/help-content.ts`
- **WASM Build**: `scripts/build-libjxl.sh`

## Deployment

Build outputs to `dist/`. Can be deployed to any static hosting.

For GitHub Pages at `www.januschka.com/jxl-art`:
1. Build: `npm run build:ghpages`
2. Copy `dist/` contents to the `jxl-art/` folder in `hjanuschka.github.io` repo
3. Commit and push the `hjanuschka.github.io` repo

```bash
# Example deploy
npm run build:ghpages
cp -r dist/* ../hjanuschka.github.io/jxl-art/
cd ../hjanuschka.github.io
git add jxl-art/
git commit -m "Update JXL Art"
git push
```

## Notes

- libjxl's `jxl_from_tree` tool is used to convert tree descriptions to JXL
- The WASM module exposes two functions: `jxl_from_tree(code)` and `decode(jxlData)`
- jxl-rs (Rust) was considered but it's decoder-only, no tree encoder exists
