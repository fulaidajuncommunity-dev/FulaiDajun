// 規約頁面共用的渲染器：把 assets/regulations/regulations.json 裡屬於自己的那份文件
// 的內容區塊渲染進 <div id="doc-body">。
//
// 2026-08-26 新增，取代原本每份規約各自把全文寫死成靜態 HTML 的做法——單一事實來源是
// regulations.json（一支陣列，每個元素是一份文件，用 id 欄位對應各頁面 <div id="doc-body">
// 的 data-doc-id），community-rules-qa 那支 Worker 也是讀同一份 JSON 組知識庫給 Gemini，
// 兩邊保證不會再各自維護一份、改了一邊忘記改另一邊。
//
// 2026-08-26（同一天內第二次調整）：一開始是 15 份文件各自拆成獨立的 <id>.json（01~15），
// 後來發現「同一份規約內容要維護兩份檔案」（獨立檔 + 給 rules-qa 用的合併檔）本身就是多餘
// 的分裂，違背「單一事實來源」的初衷，索性直接只留一份 regulations.json，這支渲染器改成
// fetch 整份、用 data-doc-id 從陣列裡挑出自己要的那個元素渲染。
//
// 03 號（裝修施工管理辦法）後面接的空白列印表單（附件一到附件九）不在這份 JSON 裡，維持
// 原本寫死在頁面上，這支渲染器只負責 <div id="doc-body"> 這個掛載點，不會動到後面的表單。
(function () {
  var mount = document.getElementById('doc-body');
  if (!mount) return;
  var docId = mount.getAttribute('data-doc-id');
  if (!docId) return;

  fetch('../assets/regulations/regulations.json')
    .then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (docs) {
      var doc = docs.find(function (d) { return d.id === docId; });
      if (!doc) throw new Error('regulations.json 裡找不到 id=' + docId + ' 的文件');
      mount.innerHTML = doc.blocks
        .map(function (b) {
          if (b.type === 'heading') return '<h' + b.level + '>' + b.text + '</h' + b.level + '>';
          if (b.type === 'paragraph') {
            var cls = b.indent ? ' class="indent-' + b.indent + '"' : '';
            return '<p' + cls + '>' + b.html + '</p>';
          }
          return b.html; // type: 'html'，原樣輸出（例如裝修辦法的雙欄流程圖）
        })
        .join('\n');
    })
    .catch(function (err) {
      console.error('regulation-renderer: 載入失敗', err);
      mount.innerHTML = '<p>載入規約內容時發生問題，請重新整理，或直接洽管理中心 03-5990857。</p>';
    });
})();
