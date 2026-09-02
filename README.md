# JXL Art

Create art using JPEG XL prediction trees. A modern reimplementation of [jxl-art.surma.technology](https://jxl-art.surma.technology/).

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

Live: https://www.januschka.com/jxl-art/

## Building WASM (libjxl)

The WASM module is pre-built, but you can rebuild it from the latest libjxl:

### Prerequisites

Install [Emscripten](https://emscripten.org/docs/getting_started/downloads.html):

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source emsdk_env.sh
```

### Build

```bash
npm run build:wasm
```

Options:
```bash
# Use specific libjxl branch
LIBJXL_BRANCH=v0.11.x npm run build:wasm
```

## Production Build

```bash
npm run build
npm run preview
```

## GitHub Pages Build

```bash
npm run build:ghpages
```

This builds with the correct `/jxl-art/` base path for deployment.
## How JXL Art Works

JPEG XL's modular mode uses prediction trees to predict pixel values based on neighboring pixels. In JXL art, the prediction error is always zero, so the image consists only of the prediction tree itself.

Click the **Help** button in the app for full documentation on the tree syntax.

## Example

```
Bitdepth 8
Width 512
Height 512

if c > 1
  if y > 256
    - Set 200
    - Set 100
  - Gradient + 50
if y > 256
  - W + 30
  - Set 180
```

## Features

- 🎨 Real-time JXL art creation
- 📏 Zoom & pan preview
- 🔗 Share via URL
- 💾 Auto-save code
- ✨ Code prettifier
- 🧠 Syntax highlighting + autocomplete
- 🧩 Preset gallery with previews
- 📖 Built-in help

## Credits

- Original [jxl-art](https://github.com/nicories/jxl-art) by [Surma](https://surma.dev)
- [libjxl](https://github.com/libjxl/libjxl) - Reference JPEG XL implementation
- Blog post: https://www.januschka.com/chromium-jxl-resurrection.html

## License

Apache-2.0
