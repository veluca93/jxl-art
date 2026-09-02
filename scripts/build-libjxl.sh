#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/.build/libjxl"
OUTPUT_DIR="$PROJECT_DIR/wasm/libjxl"

# Configuration
LIBJXL_REPO="https://github.com/libjxl/libjxl.git"
LIBJXL_REF="${LIBJXL_REF:-HEAD}"  # Use HEAD (latest) by default, or specify commit/branch/tag

echo "=== Building libjxl WASM ==="
echo "Ref: $LIBJXL_REF"
echo ""

# Check for emscripten
if ! command -v emcc &> /dev/null; then
    echo "Error: emscripten not found. Please install and activate emsdk."
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
    echo "  source emsdk_env.sh"
    exit 1
fi

echo "Emscripten version: $(emcc --version | head -1)"
echo ""

# Clone/update libjxl
mkdir -p "$BUILD_DIR"
if [ ! -d "$BUILD_DIR/libjxl" ]; then
    echo "Cloning libjxl..."
    git clone "$LIBJXL_REPO" "$BUILD_DIR/libjxl"
    cd "$BUILD_DIR/libjxl"
else
    echo "Updating libjxl..."
    cd "$BUILD_DIR/libjxl"
    git fetch origin
fi

# Checkout the specified ref (HEAD = latest main)
if [ "$LIBJXL_REF" = "HEAD" ]; then
    git checkout origin/main
else
    git checkout "$LIBJXL_REF"
fi
git submodule update --init --recursive

COMMIT=$(git rev-parse --short HEAD)
echo "Building from commit: $COMMIT"
echo ""

# Apply patch for buffering (needed for jxl_from_tree)
if grep -q "int buffering = -1;" lib/jxl/enc_params.h 2>/dev/null; then
    echo "Applying buffering patch..."
    sed -i.bak 's/int buffering = -1;/int buffering = 0;/' lib/jxl/enc_params.h
fi

# Build with emcmake
echo "Configuring build..."
mkdir -p "$BUILD_DIR/build"
cd "$BUILD_DIR/build"

emcmake cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DJPEGXL_ENABLE_BENCHMARK=OFF \
    -DJPEGXL_ENABLE_EXAMPLES=OFF \
    -DJPEGXL_ENABLE_TOOLS=OFF \
    -DJPEGXL_ENABLE_MANPAGES=OFF \
    -DJPEGXL_ENABLE_JNI=OFF \
    -DJPEGXL_ENABLE_TCMALLOC=OFF \
    -DJPEGXL_ENABLE_SJPEG=OFF \
    -DJPEGXL_BUNDLE_LIBPNG=ON \
    -DBUILD_TESTING=OFF \
    "$BUILD_DIR/libjxl"

echo ""
echo "Building libjxl..."
emmake make -j$(nproc) jxl jxl_cms

# Now compile our wrapper
echo ""
echo "Building WASM wrapper..."
mkdir -p "$OUTPUT_DIR"

cat > "$BUILD_DIR/jxl_wrapper.cpp" << 'WRAPPER_EOF'
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <fstream>
#include <sstream>
#include <vector>

#include "lib/jxl/color_encoding_internal.h"
#include <jxl/cms.h>
#include <jxl/decode.h>
#include "lib/extras/dec/jxl.h"
#include "lib/extras/enc/apng.h"

using namespace emscripten;

namespace jpegxl::tools {
int JxlFromTree(const char *in, const char *out, const char *tree_out);
}

val jxl_from_tree(std::string code) {
    // Write input to virtual filesystem
    std::ofstream inFile("/input.tree");
    if (!inFile) {
        return val("Failed to create input file");
    }
    inFile << code;
    inFile.close();
    
    // Run jxl_from_tree
    int result = jpegxl::tools::JxlFromTree("/input.tree", "/output.jxl", nullptr);
    if (result != 0) {
        return val("jxl_from_tree failed with code " + std::to_string(result));
    }
    
    // Read output
    std::ifstream outFile("/output.jxl", std::ios::binary);
    if (!outFile) {
        return val("Failed to read output file");
    }
    std::vector<uint8_t> data((std::istreambuf_iterator<char>(outFile)),
                               std::istreambuf_iterator<char>());
    outFile.close();
    
    return val(typed_memory_view(data.size(), data.data()));
}

val decode(val jxlDataVal) {
    // Convert JS Uint8Array to C++ vector
    std::vector<uint8_t> jxlData = vecFromJSArray<uint8_t>(jxlDataVal);
    
    auto png_encoder = jxl::extras::GetAPNGEncoder();
    if (!png_encoder) {
        return val("Failed to get PNG encoder");
    }
    
    jxl::extras::PackedPixelFile ppf;
    jxl::extras::JXLDecompressParams dparams;
    dparams.output_bitdepth.type = JXL_BIT_DEPTH_FROM_CODESTREAM;
    dparams.accepted_formats = png_encoder->AcceptedFormats();
    
    size_t decoded_bytes;
    if (!jxl::extras::DecodeImageJXL(
            jxlData.data(),
            jxlData.size(), dparams, &decoded_bytes, &ppf)) {
        return val("Failed to decode JXL");
    }
    
    jxl::extras::EncodedImage encoded;
    if (!png_encoder->Encode(ppf, &encoded, nullptr)) {
        return val("Failed to encode PNG");
    }
    
    if (encoded.bitstreams.empty()) {
        return val("No PNG data generated");
    }
    
    const auto& png = encoded.bitstreams.front();
    return val(typed_memory_view(png.size(), png.data()));
}

EMSCRIPTEN_BINDINGS(jxl_art) {
    function("jxl_from_tree", &jxl_from_tree);
    function("decode", &decode);
}
WRAPPER_EOF

em++ \
    -O3 \
    -I "$BUILD_DIR/libjxl" \
    -I "$BUILD_DIR/libjxl/lib" \
    -I "$BUILD_DIR/libjxl/lib/include" \
    -I "$BUILD_DIR/build/lib/include" \
    -I "$BUILD_DIR/libjxl/third_party/highway" \
    -I "$BUILD_DIR/libjxl/third_party/skcms" \
    --bind \
    --closure 1 \
    -s INVOKE_RUN=0 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s EXPORT_NAME="createJxlModule" \
    -s ENVIRONMENT=worker \
    -s USE_LIBPNG=1 \
    -DJPEGXL_ENABLE_APNG=1 \
    -o "$OUTPUT_DIR/jxl.js" \
    "$BUILD_DIR/jxl_wrapper.cpp" \
    "$BUILD_DIR/libjxl/tools/no_memory_manager.cc" \
    "$BUILD_DIR/libjxl/tools/jxl_from_tree.cc" \
    "$BUILD_DIR/libjxl/lib/extras/common.cc" \
    "$BUILD_DIR/libjxl/lib/extras/enc/apng.cc" \
    "$BUILD_DIR/libjxl/lib/extras/exif.cc" \
    "$BUILD_DIR/libjxl/lib/extras/dec/jxl.cc" \
    "$BUILD_DIR/libjxl/lib/extras/enc/encode.cc" \
    "$BUILD_DIR/libjxl/lib/extras/dec/color_description.cc" \
    "$BUILD_DIR/libjxl/lib/extras/packed_image.cc" \
    "$BUILD_DIR/build/lib/libjxl.a" \
    "$BUILD_DIR/build/lib/libjxl_cms.a" \
    "$BUILD_DIR/build/third_party/brotli/libbrotlidec.a" \
    "$BUILD_DIR/build/third_party/brotli/libbrotlienc.a" \
    "$BUILD_DIR/build/third_party/brotli/libbrotlicommon.a" \
    "$BUILD_DIR/build/third_party/highway/libhwy.a"

# Write build info
cat > "$OUTPUT_DIR/build-info.json" << EOF
{
  "builtAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$COMMIT",
  "ref": "$LIBJXL_REF"
}
EOF

echo ""
echo "=== Build complete ==="
echo "Output: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"
