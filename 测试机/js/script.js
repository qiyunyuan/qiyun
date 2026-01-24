import { switchPage } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    // 监听“设置”按钮点击
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }

    // 监听“返回主页”按钮点击
    const btnBack = document.getElementById('btn-back-home');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            switchPage('page-home');
        });
    }
});
