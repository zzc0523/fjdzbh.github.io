/*
 * axhub-annotation-standalone
 * 纯前端原型标注工具：点击元素批注 + 矩形框选批注
 * 数据持久化于 localStorage（按页面文件名隔离），支持导出/导入 JSON。
 * 用法：浏览器控制台执行 Annotation.start()，或注入本脚本后点击浮动工具条。
 */
(function (global) {
  'use strict';

  var STORAGE_PREFIX = 'axhub_anno_';
  var NS = 'axhub-anno';
  var COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  var state = {
    active: false,
    mode: 'click',      // 'click' | 'rect'
    colorIndex: 0,
    items: [],          // {id, type:'click'|'rect', selector, text, x, y, w, h, rect:{left,top,width,height}, createdAt}
    root: null,
    bar: null,
    drawing: null,
    startPt: null,
    hoverEl: null
  };

  function pageKey() {
    var f = location.pathname.split('/').pop() || 'index';
    return STORAGE_PREFIX + f;
  }

  function load() {
    try {
      var raw = localStorage.getItem(pageKey());
      state.items = raw ? JSON.parse(raw) : [];
    } catch (e) { state.items = []; }
  }

  function save() {
    try { localStorage.setItem(pageKey(), JSON.stringify(state.items)); } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function el(sel, attrs, html) {
    var e = document.createElementNS(
      sel.indexOf(':') > -1 ? 'http://www.w3.org/1999/xhtml' : 'http://www.w3.org/1999/xhtml', sel);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function makeRoot() {
    if (state.root) return;
    var root = el('div', {
      id: NS + '-root',
      style: 'all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;'
    });
    document.documentElement.appendChild(root);
    state.root = root;
  }

  /* ---------- 工具条 ---------- */
  function buildBar() {
    var bar = el('div', {
      id: NS + '-bar',
      style: [
        'all:initial', 'position:fixed', 'top:14px', 'right:14px', 'z-index:2147483001',
        'display:flex', 'gap:6px', 'align-items:center',
        'background:#111827', 'color:#fff', 'padding:8px 10px', 'border-radius:10px',
        'font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif', 'box-shadow:0 6px 24px rgba(0,0,0,.3)',
        'pointer-events:auto', 'user-select:none'
      ].join(';') + ';'
    });

    function btn(label, title, onClick, active) {
      var b = el('button', {
        type: 'button',
        title: title,
        style: [
          'all:initial', 'cursor:pointer', 'border:none', 'border-radius:6px',
          'padding:6px 10px', 'font:13px/1 -apple-system,Segoe UI,Roboto,sans-serif',
          'color:#fff', 'background:' + (active ? '#3B82F6' : '#374151')
        ].join(';') + ';'
      }, label);
      b.addEventListener('click', onClick);
      return b;
    }

    var title = el('span', { style: 'all:initial;font-weight:600;margin-right:4px;' }, '标注');
    var bClick = btn('点击', '点击元素批注', function () { setMode('click'); }, true);
    var bRect = btn('框选', '拖动矩形框选', function () { setMode('rect'); }, false);
    var bColor = btn('●', '切换颜色', function () {
      state.colorIndex = (state.colorIndex + 1) % COLORS.length;
      bColor.style.color = COLORS[state.colorIndex];
    }, false);
    bColor.style.color = COLORS[0];
    bColor.style.background = '#374151';
    var bExport = btn('导出', '导出为 JSON 文件', exportJSON, false);
    var bImport = btn('导入', '导入 JSON 文件', function () { fileInput().click(); }, false);
    var bClear = btn('清空', '清空本页标注', function () {
      if (confirm('确定清空本页所有标注？')) { state.items = []; save(); render(); }
    }, false);
    var bClose = btn('✕', '关闭标注模式', stop, false);

    [title, bClick, bRect, bColor, bExport, bImport, bClear, bClose].forEach(function (n) { bar.appendChild(n); });
    state.bar = bar;
    state.bar._btns = { click: bClick, rect: bRect };
    makeRoot();
    state.root.appendChild(bar);
  }

  function setMode(m) {
    state.mode = m;
    if (state.bar && state.bar._btns) {
      state.bar._btns.click.style.background = m === 'click' ? '#3B82F6' : '#374151';
      state.bar._btns.rect.style.background = m === 'rect' ? '#3B82F6' : '#374151';
    }
    document.body.style.cursor = state.active ? (m === 'rect' ? 'crosshair' : 'pointer') : '';
  }

  /* ---------- 选择器生成 ---------- */
  function uniqueSelector(node) {
    if (node.id) return '#' + node.id;
    var parts = [];
    while (node && node.nodeType === 1 && node !== document.body) {
      var sib = Array.prototype.filter.call(node.parentNode.children, function (c) {
        return c.tagName === node.tagName;
      });
      var tag = node.tagName.toLowerCase();
      parts.unshift(sib.length > 1 ? tag + ':nth-child(' + (Array.prototype.indexOf.call(node.parentNode.children, node) + 1) + ')' : tag);
      node = node.parentNode;
    }
    return parts.join(' > ');
  }

  function resolve(sel) {
    try { return document.querySelector(sel); } catch (e) { return null; }
  }

  /* ---------- 弹窗（输入/编辑批注） ---------- */
  function openEditor(item, onSubmit) {
    var overlay = el('div', {
      id: NS + '-editor',
      style: [
        'all:initial', 'position:fixed', 'inset:0', 'z-index:2147483002',
        'background:rgba(0,0,0,.35)', 'display:flex', 'align-items:center', 'justify-content:center',
        'pointer-events:auto', 'font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif'
      ].join(';') + ';'
    });
    var box = el('div', {
      style: [
        'all:initial', 'background:#fff', 'border-radius:12px', 'width:min(420px,92vw)',
        'padding:18px', 'box-shadow:0 12px 40px rgba(0,0,0,.3)'
      ].join(';') + ';'
    });
    var ta = el('textarea', {
      placeholder: '输入批注内容…',
      style: [
        'all:initial', 'width:100%', 'min-height:110px', 'resize:vertical', 'box-sizing:border-box',
        'border:1px solid #d1d5db', 'border-radius:8px', 'padding:10px', 'font:14px/1.5 inherit', 'outline:none'
      ].join(';') + ';'
    });
    if (item && item.text) ta.value = item.text;
    var row = el('div', { style: 'all:initial;display:flex;justify-content:flex-end;gap:8px;margin-top:12px;' });
    var cancel = el('button', { type: 'button', style: 'all:initial;cursor:pointer;border:1px solid #d1d5db;background:#fff;border-radius:8px;padding:8px 14px;font:14px inherit;' }, '取消');
    var ok = el('button', { type: 'button', style: 'all:initial;cursor:pointer;border:none;background:#3B82F6;color:#fff;border-radius:8px;padding:8px 14px;font:14px inherit;' }, item ? '保存' : '添加');
    row.appendChild(cancel); row.appendChild(ok);
    box.appendChild(ta); box.appendChild(row); overlay.appendChild(box);
    makeRoot(); state.root.appendChild(overlay);
    setTimeout(function () { ta.focus(); }, 30);

    function close() { overlay.remove(); }
    cancel.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    ok.addEventListener('click', function () {
      var v = ta.value.trim();
      if (!v) { ta.focus(); return; }
      close(); onSubmit(v);
    });
  }

  /* ---------- 渲染标注 ---------- */
  function render() {
    if (!state.root) return;
    // 清掉旧 pin/rect（保留工具条与编辑层）
    Array.prototype.slice.call(state.root.querySelectorAll('.' + NS + '-pin,.' + NS + '-rect')).forEach(function (n) { n.remove(); });

    state.items.forEach(function (it) {
      var color = it.color || COLORS[0];
      if (it.type === 'click') {
        var node = resolve(it.selector);
        if (!node) return;
        var r = node.getBoundingClientRect();
        var pin = el('div', {
          class: NS + '-pin',
          title: it.text || '',
          style: [
            'all:initial', 'position:fixed', 'pointer-events:auto', 'cursor:pointer',
            'left:' + (r.left + r.width) + 'px', 'top:' + (r.top) + 'px',
            'transform:translate(-50%,-50%)', 'width:22px', 'height:22px', 'border-radius:50%',
            'background:' + color, 'color:#fff', 'font:12px/22px -apple-system,Segoe UI,Roboto,sans-serif',
            'text-align:center', 'box-shadow:0 2px 6px rgba(0,0,0,.3)', 'z-index:2147483000'
          ].join(';') + ';'
        }, String(it.no));
        pin.addEventListener('click', function (e) { e.stopPropagation(); openViewer(it); });
        state.root.appendChild(pin);
      } else if (it.type === 'rect') {
        var rc = it.rect;
        var box = el('div', {
          class: NS + '-rect',
          title: it.text || '',
          style: [
            'all:initial', 'position:fixed', 'pointer-events:auto', 'cursor:pointer',
            'left:' + rc.left + 'px', 'top:' + rc.top + 'px',
            'width:' + rc.width + 'px', 'height:' + rc.height + 'px',
            'border:2px solid ' + color, 'background:' + color + '22', 'border-radius:4px',
            'z-index:2147483000'
          ].join(';') + ';'
        });
        var tag = el('div', {
          style: [
            'all:initial', 'position:absolute', 'left:-2px', 'top:-22px', 'background:' + color, 'color:#fff',
            'font:11px/18px -apple-system,Segoe UI,Roboto,sans-serif', 'padding:0 6px', 'border-radius:4px'
          ].join(';') + ';'
        }, String(it.no));
        box.appendChild(tag);
        box.addEventListener('click', function (e) { e.stopPropagation(); openViewer(it); });
        state.root.appendChild(box);
      }
    });
  }

  function openViewer(it) {
    var overlay = el('div', {
      style: [
        'all:initial', 'position:fixed', 'inset:0', 'z-index:2147483002', 'background:rgba(0,0,0,.35)',
        'display:flex', 'align-items:center', 'justify-content:center', 'pointer-events:auto',
        'font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif'
      ].join(';') + ';'
    });
    var box = el('div', { style: 'all:initial;background:#fff;border-radius:12px;width:min(440px,92vw);padding:18px;box-shadow:0 12px 40px rgba(0,0,0,.3);' });
    var head = el('div', { style: 'all:initial;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;' });
    head.appendChild(el('strong', { style: 'all:initial;font-size:15px;' }, '标注 #' + it.no));
    var del = el('button', { type: 'button', style: 'all:initial;cursor:pointer;border:none;background:#FEE2E2;color:#B91C1C;border-radius:6px;padding:5px 10px;font:13px inherit;' }, '删除');
    head.appendChild(del);
    var body = el('div', { style: 'all:initial;white-space:pre-wrap;color:#1F2937;max-height:50vh;overflow:auto;' }, it.text || '(空)');
    var row = el('div', { style: 'all:initial;display:flex;justify-content:flex-end;gap:8px;margin-top:14px;' });
    var edit = el('button', { type: 'button', style: 'all:initial;cursor:pointer;border:1px solid #d1d5db;background:#fff;border-radius:8px;padding:8px 14px;font:14px inherit;' }, '编辑');
    var close = el('button', { type: 'button', style: 'all:initial;cursor:pointer;border:none;background:#3B82F6;color:#fff;border-radius:8px;padding:8px 14px;font:14px inherit;' }, '关闭');
    row.appendChild(edit); row.appendChild(close);
    box.appendChild(head); box.appendChild(body); box.appendChild(row); overlay.appendChild(box);
    makeRoot(); state.root.appendChild(overlay);
    function removeOverlay() { overlay.remove(); }
    close.addEventListener('click', removeOverlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) removeOverlay(); });
    edit.addEventListener('click', function () {
      removeOverlay();
      openEditor(it, function (text) { it.text = text; save(); render(); });
    });
    del.addEventListener('click', function () {
      if (confirm('删除该标注？')) {
        state.items = state.items.filter(function (x) { return x.id !== it.id; });
        renumber(); save(); render(); removeOverlay();
      }
    });
  }

  function renumber() {
    state.items.forEach(function (it, i) { it.no = i + 1; });
  }

  /* ---------- 交互 ---------- */
  function onMouseMove(e) {
    if (!state.active) return;
    if (state.mode === 'click') {
      // 高亮 hover 元素
      var node = e.target;
      if (state.hoverEl && state.hoverEl !== node) state.hoverEl.style.outline = state.hoverEl._axhubOutline || '';
      if (node && node.closest && !node.closest('#' + NS + '-root')) {
        if (node._axhubOutline === undefined) node._axhubOutline = node.style.outline;
        node.style.outline = '2px dashed #3B82F6';
        state.hoverEl = node;
      }
    } else if (state.mode === 'rect' && state.drawing) {
      var s = state.startPt;
      var box = state.drawing;
      var left = Math.min(s.x, e.clientX), top = Math.min(s.y, e.clientY);
      var w = Math.abs(e.clientX - s.x), h = Math.abs(e.clientY - s.y);
      box.style.left = left + 'px'; box.style.top = top + 'px';
      box.style.width = w + 'px'; box.style.height = h + 'px';
    }
  }

  function onMouseDown(e) {
    if (!state.active || state.mode !== 'rect') return;
    if (e.target.closest && e.target.closest('#' + NS + '-root')) return;
    e.preventDefault();
    state.startPt = { x: e.clientX, y: e.clientY };
    var box = el('div', {
      style: [
        'all:initial', 'position:fixed', 'left:' + e.clientX + 'px', 'top:' + e.clientY + 'px',
        'width:0', 'height:0', 'border:2px solid #3B82F6', 'background:#3B82F622',
        'border-radius:4px', 'pointer-events:none', 'z-index:2147483000'
      ].join(';') + ';'
    });
    makeRoot(); state.root.appendChild(box);
    state.drawing = box;
  }

  function onMouseUp(e) {
    if (!state.active) return;
    if (state.mode === 'click') {
      var node = e.target;
      if (node && node.closest && node.closest('#' + NS + '-root')) return;
      if (!node || node === document.body || node === document.documentElement) return;
      e.preventDefault();
      var target = node;
      openEditor(null, function (text) {
        var item = {
          id: uid(), type: 'click', selector: uniqueSelector(target),
          text: text, color: COLORS[state.colorIndex], createdAt: Date.now()
        };
        state.items.push(item); renumber(); save(); render();
      });
      return;
    }
    if (state.mode === 'rect' && state.drawing) {
      var box = state.drawing; state.drawing = null;
      var w = parseFloat(box.style.width), h = parseFloat(box.style.height);
      var left = parseFloat(box.style.left), top = parseFloat(box.style.top);
      box.remove();
      if (w < 8 || h < 8) return; // 误触
      openEditor(null, function (text) {
        var item = {
          id: uid(), type: 'rect', rect: { left: left, top: top, width: w, height: h },
          text: text, color: COLORS[state.colorIndex], createdAt: Date.now()
        };
        state.items.push(item); renumber(); save(); render();
      });
    }
  }

  function onScroll() { if (state.active) render(); }

  /* ---------- 导出/导入 ---------- */
  function exportJSON() {
    var data = { page: location.pathname.split('/').pop(), items: state.items };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'anno_' + (data.page || 'page') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function fileInput() {
    if (state._fileInput) return state._fileInput;
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.addEventListener('change', function () {
      var f = inp.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (Array.isArray(data.items)) { state.items = data.items; renumber(); save(); render(); }
        } catch (e) { alert('导入失败：文件格式不正确'); }
      };
      reader.readAsText(f);
      inp.value = '';
    });
    state._fileInput = inp;
    return inp;
  }

  /* ---------- 生命周期 ---------- */
  function start() {
    if (state.active) return;
    state.active = true;
    load();
    makeRoot();
    buildBar();
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mouseup', onMouseUp, true);
    window.addEventListener('scroll', onScroll, true);
    setMode('click');
    render();
  }

  function stop() {
    if (!state.active) return;
    state.active = false;
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('mouseup', onMouseUp, true);
    window.removeEventListener('scroll', onScroll, true);
    if (state.root) state.root.remove();
    state.root = null; state.bar = null; state.drawing = null; state.hoverEl = null;
  }

  function toggle() { state.active ? stop() : start(); }

  var API = { start: start, stop: stop, toggle: toggle, render: render, export: exportJSON };
  global.Annotation = API;

  // 注入脚本后自动启动（bookmarklet 模式）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
