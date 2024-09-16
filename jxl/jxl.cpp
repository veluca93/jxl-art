/**
 * Copyright 2021 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "lib/jxl/color_encoding_internal.h"
#include <jxl/cms.h>
#include <jxl/color_encoding.h>
#include <jxl/decode.h>
#include "lib/extras/dec/jxl.h"
#include "lib/extras/enc/apng.h"

#include <fstream>
#include <iostream>
#include <jxl/types.h>
#include <sstream>

using namespace emscripten;

// R, G, B, A
#define COMPONENTS_PER_PIXEL 4

#define EXPECT_TRUE(a)                                                         \
  if (!(a)) {                                                                  \
    fprintf(stderr, "Assertion failure (%d): %s\n", __LINE__, #a);             \
    return val::null();                                                        \
  }
#define EXPECT_EQ(a, b)                                                        \
  {                                                                            \
    int a_ = a;                                                                \
    int b_ = b;                                                                \
    if (a_ != b_) {                                                            \
      fprintf(stderr, "Assertion failure (%d): %s (%d) != %s (%d)\n",          \
              __LINE__, #a, a_, #b, b_);                                       \
      return {val::null()};                                                    \
    }                                                                          \
  }

val decode(std::string data) {
  auto png_encoder = jxl::extras::GetAPNGEncoder();
  jxl::extras::PackedPixelFile ppf;
  auto accepted_formats = png_encoder->AcceptedFormats();
  jxl::extras::JXLDecompressParams dparams;
  dparams.output_bitdepth.type = JXL_BIT_DEPTH_FROM_CODESTREAM;
  dparams.accepted_formats = accepted_formats;

  size_t decoded_bytes;
  jxl::extras::DecodeImageJXL((const uint8_t *)data.c_str(), data.size(), dparams, &decoded_bytes, &ppf);
  jxl::extras::EncodedImage encoded_image;
  if (!png_encoder->Encode(ppf, &encoded_image, nullptr)) return val();
  static std::vector<uint8_t> png;
  png = encoded_image.bitstreams.front();

  return val(typed_memory_view(png.size(), png.data()));
}

namespace jpegxl::tools {
// Forward declaration
int JxlFromTree(const char *in, const char *out, const char *tree_out);
} // namespace jpegxl::tools

val jxl_from_tree(std::string in) {
  std::ofstream jxlTree("/in.jxl");
  jxlTree << in;
  jxlTree.close();
  jpegxl::tools::JxlFromTree("/in.jxl", "/out.jxl", nullptr);
  std::ifstream jxlImg("/out.jxl");
  std::stringstream jxlStream;
  jxlStream << jxlImg.rdbuf();
  static std::string jxlData;
  jxlData = jxlStream.str();
  jxlImg.close();
  return val(
      typed_memory_view(jxlData.length(), (const uint8_t *)jxlData.c_str()));
}

EMSCRIPTEN_BINDINGS(my_module) {
  emscripten::function("jxl_from_tree", &jxl_from_tree);
  emscripten::function("decode", &decode);
  register_vector<val>("vector<val>");
}
