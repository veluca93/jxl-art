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

import {get, set} from "idb-keyval";

import inflate from "./inflate.js";
import {process} from "./api.js";
import {imageDataToCanvas, canvasToBlob, unindent} from "./utils.js";
import {
  generateInsecureKeyFromString,
  decryptStringWithKey,
  encryptStringWithKey,
} from "./crypto.js";

async function lol() {}
lol();

const {title, artist, publishbtn, img, bottest} = document.all;
let blob;
let code;
let jxlData;
let zcode;
async function main() {
  const p = new URLSearchParams(location.search);
  if (!p.has("payload")) {
    location.href = "/";
    return;
  }
  zcode = p.get("payload");
  code = inflate(atob(zcode));

  const prevTitle = await get("previous-title");
  if (prevTitle) {
    title.value = prevTitle;
  }

  const prevArtist = await get("previous-artist");
  if (prevArtist) {
    artist.value = prevArtist;
  }

  let imageData;
  try {
    ({jxlData, imageData} = await process(code));
  } catch (e) {
    location.href = "/";
    return;
  }

  blob = new File([new Blob([imageData])], 'art.png', { type: 'image/png' });
  img.src = URL.createObjectURL(blob);
  publishbtn.disabled = false;
}

publishbtn.onclick = async () => {
  let hookURL;
  try {
    const keyphrase = bottest.value.toLowerCase();
    const key = await generateInsecureKeyFromString(crypto, keyphrase);
    // These data strings, with the correct keyphrase, decode to the hook for the #jxl-art channel on the JPEG XL server.
    const hookIv = new Uint8Array([143, 99, 78, 22, 50, 55, 74, 140, 203, 26, 107, 171, 35, 25, 146, 95]);
    const hookData = new Uint8Array([178, 110, 237, 203, 46, 189, 45, 234, 140, 26, 76, 186, 131, 180, 23, 174, 244, 241, 33, 247, 3, 203, 165, 153, 118, 202, 89, 204, 91, 129, 99, 35, 195, 81, 148, 60, 116, 149, 150, 112, 4, 214, 110, 239, 183, 60, 206, 4, 182, 74, 246, 229, 212, 10, 47, 185, 67, 192, 159, 67, 132, 29, 9, 178, 171, 209, 126, 171, 80, 90, 233, 201, 39, 11, 146, 45, 106, 65, 182, 42, 203, 6, 1, 253, 82, 116, 119, 172, 77, 201, 151, 251, 85, 234, 2, 78, 222, 116, 116, 92, 12, 18, 93, 74, 81, 121, 91, 2, 179, 13, 120, 95, 240, 179, 187, 183, 121, 3, 48, 95, 136, 231, 195, 77, 238, 39, 92, 253]);
    hookURL = JSON.parse(
      await decryptStringWithKey(crypto, hookData, hookIv, key)
    );
  } catch (e) {
    console.log(e);
    bottest.style.borderColor = "red";
    return;
  }
  publishbtn.disabled = true;

  const formData = new FormData();

  const content = unindent(`
    **${artist.value}**
    _“${title.value}”_
    ${new Date().getFullYear()}
    image/jxl
    ${jxlData.byteLength} bytes

    [source tree](https://jxl-art.lucaversari.it/?${new URLSearchParams({
    zcode,
  }).toString()})
  `);
  formData.append("payload_json", JSON.stringify({content}));
  formData.append("file", blob);

  await fetch(hookURL, {
    method: "POST",
    body: formData,
  });
  await set("previous-artist", artist.value);
  await set("previous-title", title.value);
  location.href = "/";
};
main();
