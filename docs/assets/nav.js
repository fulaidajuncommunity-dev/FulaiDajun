// 富來大郡網站共用的 header/footer 渲染 + 導覽列行為。
//
// 2026-08-26：從「純行為腳本」擴充成也負責注入 header/footer 的實際內容——原本 8 個主要
// 頁面（index／about／announcements／bot-guide／cleaning／facilities／rules-fees／staff）
// 各自貼一份完全相同的 header/footer 靜態 HTML（社區名稱、地址、電話、辦公時間、導覽
// 連結），改一個地方（例如電話號碼、新增一個導覽項目）要記得同步改 8 個檔案。現在單一
// 事實來源改成 assets/site-info.json，這裡讀出來注入進 #site-header／#site-footer
// 這兩個掛載點（見各頁面的說明）。
(function () {
  var headerMount = document.getElementById('site-header');
  var footerMount = document.getElementById('site-footer');
  if (!headerMount && !footerMount) return; // 不是套用共用版面的頁面（例如 bot-form.html）

  fetch('assets/site-info.json')
    .then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (info) {
      if (headerMount) headerMount.innerHTML = buildHeaderHtml(info);
      if (footerMount) footerMount.innerHTML = buildFooterHtml(info);
      bindNavBehavior();
    })
    .catch(function (err) {
      console.error('nav.js: 讀取 site-info.json 失敗，header/footer 無法顯示', err);
    });

  function buildHeaderHtml(info) {
    var links = info.navLinks
      .map(function (l) {
        return '<a href="' + l.href + '" data-page="' + l.page + '">' + l.label + '</a>';
      })
      .join('\n      ');
    return (
      '<div class="site-header-inner">\n' +
      '  <a class="brand" href="index.html">\n' +
      '    <span class="brand-mark">' + info.communityName + '</span>\n' +
      '    <span class="brand-sub">' + info.communityNameEn + '</span>\n' +
      '  </a>\n' +
      '  <button class="nav-toggle" aria-label="開啟選單" aria-expanded="false">☰</button>\n' +
      '  <nav class="site-nav" aria-label="主導覽">\n' +
      '    ' + links + '\n' +
      '  </nav>\n' +
      '</div>'
    );
  }

  function buildFooterHtml(info) {
    return (
      '<div class="site-footer-inner">\n' +
      '  <div>\n' +
      '    <h4>社區地址' +
      '<a class="map-link" href="https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(info.communityName) +
      '" target="_blank" rel="noopener" title="在 Google 地圖開啟" aria-label="在 Google 地圖開啟' + info.communityName + '">' +
      // Google 地圖風格的彩色圖示（自繪 SVG，非官方 logo 檔以避開商標規範，小尺寸做了簡化）：
      // 彩色地圖圓 + 右上紅色定位釘，內嵌免對外請求
      '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="gm-icon-clip"><circle cx="21" cy="25" r="17"/></clipPath></defs>' +
      '<g clip-path="url(#gm-icon-clip)">' +
      '<rect width="48" height="48" fill="#9AA0A6"/>' +
      '<path d="M0 0h44L0 30Z" fill="#34A853"/>' +
      '<path d="M0 27l22 21H0Z" fill="#4285F4"/>' +
      '<path d="M-2 19 46 43 46 33 2 9Z" fill="#FBBC05"/>' +
      '<path d="M15 3 33 13 12 49 -3 40Z" fill="#fff"/>' +
      '</g>' +
      '<path fill="#EA4335" d="M33 5a9 9 0 0 0-9 9c0 6.75 9 15 9 15s9-8.25 9-15a9 9 0 0 0-9-9z"/>' +
      '<circle cx="33" cy="14" r="3.6" fill="#A50E0E"/>' +
      '</svg></a></h4>\n' +
      '    <p>' + info.address + '</p>\n' +
      '  </div>\n' +
      '  <div>\n' +
      '    <h4>辦公時間</h4>\n' +
      '    <p>' + info.officeHours + '</p>\n' +
      '  </div>\n' +
      '  <div>\n' +
      '    <h4>聯絡方式</h4>\n' +
      '    <ul><li>電話：' + info.phone + '</li></ul>\n' +
      '  </div>\n' +
      '  <div class="copyright">© ' + info.copyrightYear + ' ' + info.communityName + '管理委員會</div>\n' +
      '</div>'
    );
  }

  // 跟改版前完全一樣的行為：手機選單開合、當前頁面標示——差別只在於現在要等 header 注入
  // 完成、.nav-toggle／.site-nav 這些元素真的存在於 DOM 之後才能綁定，所以搬進 fetch 的
  // .then() 裡才呼叫，不是像原本那樣在 script 一載入就立刻執行
  function bindNavBehavior() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('open');
        });
      });
    }

    var here = document.body.getAttribute('data-page');
    if (here) {
      var current = document.querySelector('.site-nav a[data-page="' + here + '"]');
      if (current) current.setAttribute('aria-current', 'page');
    }
  }
})();
