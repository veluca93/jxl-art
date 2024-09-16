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

import { get, set } from "idb-keyval";
import inflate from "./inflate.js";
import { process, api } from "./api.js";

import { idle } from "./utils.js";
import "pinch-zoom-element";

const {
  code,
  run,
  share,
  publish,
  log,
  img,
  jxl,
  png,
  zoom,
  prettier,
} = document.all;

function showLog(error) {
  log.innerHTML = error;
}

async function storeCode() {
  set(IDBKey, code.value);
}

publish.onclick = async (ev) => {
  ev.preventDefault();
  const { default: deflate } = await import("./deflate.js");
  const payload = btoa(deflate(code.value, 9));
  const searchParams = new URLSearchParams({ payload });
  location.href = `/publish.html?${searchParams.toString()}`;
};

let jxlData;
let pngUrl;
async function rerender() {
  let imageData;
  try {
    ({ jxlData, imageData } = await process(code.value));
  } catch (e) {
    showLog(e.message);
  }
  jxl.textContent = jxl.textContent.replace(
    /(\([^)]+\))?$/,
    `(${jxlData.byteLength} bytes)`
  );
  const blob = new Blob([imageData], { type: 'image/png' });
  pngUrl = URL.createObjectURL(blob);
  img.src = pngUrl;
}

async function compile() {
  run.disabled = true;
  log.innerHTML = "";
  try {
    await rerender();
  } catch (e) {
    showLog(e.message);
  }
  [run, jxl, png].forEach((btn) => (btn.disabled = false));
}
run.onclick = compile;

share.onclick = async () => {
  const u = new URL(location);
  const p = new URLSearchParams(u.search);
  const { default: deflate } = await import("./deflate.js");
  const payload = btoa(deflate(code.value, 9));
  // change letters around so payload can be put in a url
  // padding is not needed
  const safePayload = payload.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  p.set("zcode", safePayload);
  p.delete("code");
  u.search = "?" + p.toString();
  history.replaceState({}, "", u);
  navigator.clipboard.writeText(u.toString());
  showLog("URL copied to clipboard.");
};

jxl.onclick = () => {
  if (!jxlData) {
    return;
  }
  const blob = new Blob([jxlData], { type: "image/jxl" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "art.jxl";
  a.click();
};

prettier.onclick = async () => {
  code.value = await api.prettier(code.value);
  storeCode();
};

png.onclick = async () => {
  const a = document.createElement("a");
  a.href = pngUrl;
  a.download = "art.png";
  a.click();
};

zoom.onchange = () => {
  img.classList.toggle("pixelated", zoom.scale > 1);
};

function onCodeChange() {
  storeCode();
  const u = new URL(location);
  const p = new URLSearchParams(u.search);
  p.delete("code");
  p.delete("zcode");
  u.search = "?" + p.toString();
  history.replaceState({}, "", u);
}

function onCompileShortcut(ev) {
  if (!(ev.code === "Enter" && ev.ctrlKey && ev.altKey)) {
    return;
  }
  compile();
}

const IDBKey = "source";
async function main() {
  const p = new URLSearchParams(location.search);
  let lastSource = "";
  let fromURL = false;
  if (p.has("zcode")) {
    // restore - and _ to + and /
    const b64 = p.get("zcode").replaceAll("-", "+").replaceAll("_", "/");
    lastSource = inflate(atob(b64));
    fromURL = true;
  } else if (p.has("code")) {
    lastSource = atob(p.get("code").replaceAll("-", "+").replaceAll("_", "/"));
    fromURL = true;
  } else {
    lastSource = await get(IDBKey);
  }
  if (lastSource) {
    code.value = lastSource;
  }
  code.addEventListener("input", onCodeChange);
  code.addEventListener("keydown", onCompileShortcut);
  run.disabled = false;
  if (fromURL) {
    await compile();
  }
  const rect = zoom.getBoundingClientRect();
  const scale = Math.min(rect.width, rect.height) / 1024;
  zoom.scaleTo(scale.toFixed(2));
}
main();

idle().then(() => import("./sw-installer.js"));
