import re, os
base = "/Users/mac/Desktop/AI实验室/保函平台"
wp = base + "/省级端_工作台.html"
wt = open(wp, encoding="utf-8").read()
aside = re.search(r'<aside\b[^>]*>.*?</aside>', wt, re.S).group(0)
def inject(active):
    list_cls = 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' if active == 'list' else 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all'
    cons_cls = 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' if active == 'consult' else 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all'
    ul_cls = '' if active else 'hidden'
    blk = (
        '                    <li>\n'
        '                        <button onclick="toggleSubMenu(\'service-menu\')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="service-menu-btn">\n'
        '                            <div class="flex items-center">\n'
        '                                <i class="fa fa-users mr-3 group-hover:text-blue-400"></i>\n'
        '                                <span class="font-bold">企业服务</span>\n'
        '                            </div>\n'
        '                            <i class="fa fa-angle-down text-xs transition-transform duration-200" id="service-menu-arrow"></i>\n'
        '                        </button>\n'
        '                        <ul id="service-menu" class="' + ul_cls + ' mt-2 ml-4 border-l border-slate-700 space-y-1">\n'
        '                            <li>\n'
        '                                <a href="省级端_企业列表.html" class="flex items-center py-2 px-4 text-sm ' + list_cls + '">\n'
        '                                    <span class="w-1.5 h-1.5 rounded-full ' + ('bg-white' if active == 'list' else 'bg-slate-600') + ' mr-2"></span>\n'
        '                                    企业列表\n'
        '                                </a>\n'
        '                            </li>\n'
        '                            <li>\n'
        '                                <a href="省级端_企业咨询.html" class="flex items-center py-2 px-4 text-sm ' + cons_cls + '">\n'
        '                                    <span class="w-1.5 h-1.5 rounded-full ' + ('bg-white' if active == 'consult' else 'bg-slate-600') + ' mr-2"></span>\n'
        '                                    企业咨询\n'
        '                                </a>\n'
        '                            </li>\n'
        '                        </ul>\n'
        '                    </li>\n'
    )
    pat = re.compile(r"(\n\s*<li class=\"pt-4 pb-2 px-3\">\s*\n\s*<span[^>]*>系统配置</span>)")
    return pat.sub("\n" + blk + r"\1", aside, count=1)

for f, active in [("省级端_企业列表.html", "list"), ("省级端_企业咨询.html", "consult")]:
    p = base + "/" + f
    t = open(p, encoding="utf-8").read()
    new_aside = inject(active)
    t = re.sub(r'\s*<div id="sidebar-container"></div>\s*', '\n' + new_aside + '\n', t, count=1)
    t = re.sub(r'\s*<script src="load-sidebar\.js"></script>\s*', '\n', t, count=1)
    t = t.replace('市级运营端', '省级管理平台')
    open(p, "w", encoding="utf-8").write(t)
    print("fixed", f)
