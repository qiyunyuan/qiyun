/**
 * 切换页面显示的逻辑
 * @param {string} pageId - 要显示的页面容器ID
 */
export function switchPage(pageId) {
    // 1. 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // 2. 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 背景色逻辑已移交给 CSS (.app-content) 处理，无需 JS 干预
}
