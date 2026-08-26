// 把這個資料夾裡的 01.json ~ 15.json 合併成單一一份 all.json。
//
// 為什麼要有這份合併檔：community-rules-qa（Linebot repo）原本是逐一 fetch 15 份 JSON
// 組知識庫，快取重建的那次請求要付出 15 次對 GitHub Pages 的網路往返，是可感知的延遲來源
// （跟 Gemini 快取機制本身無關，純粹是 15 次 HTTP round trip 的成本）。改成只 fetch 這一份
// all.json，網路往返次數從 15 次降到 1 次。
//
// 個別的 01.json ~ 15.json 仍然是唯一事實來源、繼續保留——FulaiDajun 前台 01~06 號規約頁面
// （regulation-renderer.js）只認得個別檔案，不會讀這份合併檔。這份 all.json 純粹是給
// community-rules-qa 用的衍生檔案，不是另一份需要手動維護的副本。
//
// 使用方式：改完任何一份 01.json ~ 15.json 之後，在這個資料夾執行：
//   node build-all.mjs
// 會覆寫 all.json，記得把 all.json 也一起 commit。

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));

const ids = readdirSync(dir)
  .filter((f) => /^\d+\.json$/.test(f))
  .sort();

const docs = ids.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));

writeFileSync(join(dir, "all.json"), JSON.stringify(docs));

console.log(`已合併 ${docs.length} 份文件（${ids.join(", ")}）→ all.json`);
