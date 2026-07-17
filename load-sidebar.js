document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    const currentPage = window.location.pathname.split('/').pop();
    
    const sidebarHTML = `
<nav class="flex-1 overflow-y-auto py-4 px-3">
    <ul class="space-y-1">
        <li>
            <a href="市级端_工作台.html" class="flex items-center p-3 ` + (currentPage === '市级端_工作台.html' ? 'bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group') + `">
                <i class="fa fa-th-large mr-3 ` + (currentPage === '市级端_工作台.html' ? '' : 'group-hover:text-blue-400') + `"></i>
                <span` + (currentPage === '市级端_工作台.html' ? ' class="font-medium"' : '') + `>工作台</span>
            </a>
        </li>
        <li>
            <a href="市级端_数据统计.html" class="flex items-center p-3 ` + (currentPage === '市级端_数据统计.html' ? 'bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group') + `">
                <i class="fa fa-bar-chart mr-3 ` + (currentPage === '市级端_数据统计.html' ? '' : 'group-hover:text-blue-400') + `"></i>
                <span` + (currentPage === '市级端_数据统计.html' ? ' class="font-medium"' : '') + `>数据统计</span>
            </a>
        </li>
        <li>
            <button onclick="toggleSubMenu('guarantee-menu')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="guarantee-menu-btn">
                <div class="flex items-center">
                    <i class="fa fa-file-text-o mr-3 group-hover:text-blue-400"></i>
                    <span class="font-bold">保函业务管理</span>
                </div>
                <i class="fa fa-angle-down text-xs transition-transform duration-200" id="guarantee-menu-arrow"></i>
            </button>
            <ul id="guarantee-menu" class="` + (currentPage.startsWith('市级端_订单') || currentPage.startsWith('市级端_保函') || currentPage.startsWith('市级端_理赔') ? '' : 'hidden') + ` mt-2 ml-4 border-l border-slate-700 space-y-1">
                <li>
                    <a href="市级端_订单管理.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_订单管理.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_订单管理.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        订单管理
                    </a>
                </li>
                <li>
                    <a href="市级端_理赔管理.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_理赔管理.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_理赔管理.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        理赔管理
                    </a>
                </li>
            </ul>
        </li>
        <li>
            <button onclick="toggleSubMenu('collab-menu')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="collab-menu-btn">
                <div class="flex items-center">
                    <i class="fa fa-handshake-o mr-3 group-hover:text-blue-400"></i>
                    <span class="font-bold">机构管理</span>
                </div>
                <i class="fa fa-angle-down text-xs transition-transform duration-200" id="collab-menu-arrow"></i>
            </button>
            <ul id="collab-menu" class="` + (currentPage.startsWith('市级端_机构') || currentPage.startsWith('市级端_产品') || currentPage.startsWith('市级端_展业') ? '' : 'hidden') + ` mt-2 ml-4 border-l border-slate-700 space-y-1">
                <li>
                    <a href="市级端_机构备案.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_机构备案.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_机构备案.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        机构备案
                    </a>
                </li>
                <li>
                    <a href="市级端_产品接入审核.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_产品接入审核.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_产品接入审核.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        产品接入审核
                    </a>
                </li>
                <li>
                    <a href="市级端_展业管理.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_展业管理.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_展业管理.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        展业管理
                    </a>
                </li>
            </ul>
        </li>
        <li>
            <button onclick="toggleSubMenu('monitor-menu')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="monitor-menu-btn">
                <div class="flex items-center">
                    <i class="fa fa-eye mr-3 group-hover:text-blue-400"></i>
                    <span class="font-bold">业务监控</span>
                </div>
                <i class="fa fa-angle-down text-xs transition-transform duration-200" id="monitor-menu-arrow"></i>
            </button>
            <ul id="monitor-menu" class="` + (currentPage.startsWith('市级端_办理') || currentPage.startsWith('市级端_服务') ? '' : 'hidden') + ` mt-2 ml-4 border-l border-slate-700 space-y-1">
                <li>
                    <a href="市级端_办理监控.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_办理监控.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_办理监控.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        办理监控
                    </a>
                </li>
                <li>
                    <a href="市级端_服务监控.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_服务监控.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_服务监控.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        服务监控
                    </a>
                </li>
            </ul>
        </li>
        <li>
            <button onclick="toggleSubMenu('service-menu')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="service-menu-btn">
                <div class="flex items-center">
                    <i class="fa fa-users mr-3 group-hover:text-blue-400"></i>
                    <span class="font-bold">企业服务</span>
                </div>
                <i class="fa fa-angle-down text-xs transition-transform duration-200" id="service-menu-arrow"></i>
            </button>
            <ul id="service-menu" class="` + (currentPage.startsWith('市级端_企业') ? '' : 'hidden') + ` mt-2 ml-4 border-l border-slate-700 space-y-1">
                <li>
                    <a href="市级端_企业列表.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_企业列表.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_企业列表.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        企业列表
                    </a>
                </li>
                <li>
                    <a href="市级端_企业咨询.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_企业咨询.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_企业咨询.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        企业咨询
                    </a>
                </li>
            </ul>
        </li>
        <li>
            <button onclick="toggleSubMenu('gov-menu')" class="w-full flex items-center justify-between p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group" id="gov-menu-btn">
                <div class="flex items-center">
                    <i class="fa fa-building mr-3 group-hover:text-blue-400"></i>
                    <span class="font-bold">政务协同管理</span>
                </div>
                <i class="fa fa-angle-down text-xs transition-transform duration-200" id="gov-menu-arrow"></i>
            </button>
            <ul id="gov-menu" class="` + (currentPage.startsWith('市级端_项目') || currentPage.startsWith('市级端_开函') ? '' : 'hidden') + ` mt-2 ml-4 border-l border-slate-700 space-y-1">
                <li>
                    <a href="市级端_项目数据同步.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_项目数据同步.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_项目数据同步.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        项目数据同步
                    </a>
                </li>
                <li>
                    <a href="市级端_开函数据同步.html" class="flex items-center py-2 px-4 text-sm ` + (currentPage === '市级端_开函数据同步.html' ? 'bg-blue-600 text-white rounded-r-md shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-r-md transition-all') + `">
                        <span class="w-1.5 h-1.5 rounded-full ` + (currentPage === '市级端_开函数据同步.html' ? 'bg-white' : 'bg-slate-600') + ` mr-2"></span>
                        开函数据同步
                    </a>
                </li>
            </ul>
        </li>
        <li class="pt-4 pb-2 px-3">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">系统管理</span>
        </li>
        <li>
            <a href="市级端_部门与人员管理.html" class="flex items-center p-3 ` + (currentPage === '市级端_部门与人员管理.html' ? 'bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group') + `">
                <i class="fa fa-users mr-3 ` + (currentPage === '市级端_部门与人员管理.html' ? '' : 'group-hover:text-blue-400') + `"></i>
                <span` + (currentPage === '市级端_部门与人员管理.html' ? ' class="font-medium"' : '') + `>部门与人员管理</span>
            </a>
        </li>
        <li>
            <a href="市级端_权限设置.html" class="flex items-center p-3 ` + (currentPage === '市级端_权限设置.html' ? 'bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group') + `">
                <i class="fa fa-user-circle mr-3 ` + (currentPage === '市级端_权限设置.html' ? '' : 'group-hover:text-blue-400') + `"></i>
                <span` + (currentPage === '市级端_权限设置.html' ? ' class="font-medium"' : '') + `>权限设置</span>
            </a>
        </li>
        <li>
            <button onclick="changePassword()" class="w-full flex items-center p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group">
                <i class="fa fa-key mr-3 group-hover:text-blue-400"></i>
                <span>修改密码</span>
            </button>
        </li>
    </ul>
</nav>
    `;

    sidebarContainer.innerHTML = sidebarHTML;

    if (typeof toggleSubMenu === 'undefined') {
        window.toggleSubMenu = function(menuId) {
            const menu = document.getElementById(menuId);
            const arrow = document.getElementById(menuId + '-arrow');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                menu.classList.add('hidden');
                arrow.style.transform = 'rotate(0deg)';
            }
        }
    }
});

function changePassword() {
    alert('修改密码功能开发中...');
}
