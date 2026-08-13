/*
 * axhub-annotation-standalone — Bookmarklet 生成器
 * 运行本脚本（或直接读取下方 BOOKMARKLET 常量）得到书签代码。
 * 把 BOOKMARKLET 的值存为浏览器书签的 URL，打开任意原型页后点击该书签即可启动标注。
 *
 * 注意：书签会从与页面同源的 annotation.js 加载引擎。
 *   - 若通过 http(s):// 本地服务器打开 HTML（推荐），annotation.js 放在站点根目录即可。
 *   - 若用 file:// 直接打开 HTML，浏览器禁止 file:// 页面加载其他 file:// 脚本，
 *     此时请用下方 FALLBACK（内联版）：把它存为书签 URL 即可，无需 annotation.js 文件。
 */
(function () {
  'use strict';

  // 优先：从同源 annotation.js 加载（需在站点根目录放 annotation.js）
  var loaderSrc = 'annotation.js';
  var BOOKMARKLET = 'javascript:(function(){var s=document.createElement("script");s.src="' +
    loaderSrc + '";s.onerror=function(){alert("未找到 annotation.js，请改用内联版书签");};' +
    'document.head.appendChild(s);})();';

  // 内联兜底：不依赖外部文件，直接把标注引擎写入书签（适用于 file:// 打开）
  // 为避免此处重复维护大段代码，内联版由 buildInline() 在运行时从 annotation.js 文本生成。
  function buildInline() {
    var fs = (typeof require !== 'undefined') ? require('fs') : null;
    var code = null;
    if (fs) { try { code = fs.readFileSync(__dirname + '/annotation.js', 'utf8'); } catch (e) {} }
    if (!code) {
      // 浏览器中无 fs：提示用 loader 版（需服务器）
      return 'javascript:alert("内联版请在 Node 环境运行本生成器以打包，或改用 loader 版（需本地服务器+根目录 annotation.js）");';
    }
    return 'javascript:(function(){' + encodeURIComponent(code) + '})();';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BOOKMARKLET: BOOKMARKLET, buildInline: buildInline };
  }

  // 控制台友好输出
  console.log('=== axhub-annotation-standalone Bookmarklet ===');
  console.log('【loader 版（推荐，需本地服务器 + 根目录 annotation.js）】');
  console.log(BOOKMARKLET);
  console.log('\n【内联版（file:// 可用，复制下方整行存为书签）】');
  console.log(buildInline());
})();
