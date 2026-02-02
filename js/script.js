import { switchPage } from './router.js';
import { initApiSettings } from './api.js';
import { initBeautify } from './beautify.js';
import { initPreset } from './preset.js';
import { initMask } from './mask.js'; 
import { initWorldBook } from './worldbook.js';
import { initWorldview } from './worldview.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化 API 模块
    initApiSettings();

    // 初始化美化设置模块
    initBeautify();

    // 初始化预设模块
    initPreset();

    // 初始化面具模块 (逻辑全移到 mask.js 了)
    initMask(); 

    // 初始化世界书模块
    initWorldBook();

    // 初始化世界观模块
    initWorldview();

    // --- 通用路由逻辑 ---

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

    // 监听“API 设置”按钮点击
    const btnOpenApi = document.getElementById('btn-open-api');
    if (btnOpenApi) {
        btnOpenApi.addEventListener('click', () => {
            switchPage('page-api-settings');
        });
    }

    // 监听“API 设置”页面的返回按钮
    const btnBackSettings = document.getElementById('btn-back-settings');
    if (btnBackSettings) {
        btnBackSettings.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }

    // 监听“美化设置”按钮点击
    const btnOpenBeautify = document.getElementById('btn-open-beautify');
    if (btnOpenBeautify) {
        btnOpenBeautify.addEventListener('click', () => {
            switchPage('page-beautify-settings');
        });
    }

    // 监听“美化设置”页面的返回按钮
    const btnBackBeautify = document.getElementById('btn-back-beautify');
    if (btnBackBeautify) {
        btnBackBeautify.addEventListener('click', () => {
            switchPage('page-settings');
        });
    }

    // 主页点击“预设”图标
    const btnOpenPreset = document.getElementById('btn-open-preset');
    if (btnOpenPreset) {
        btnOpenPreset.addEventListener('click', () => {
            switchPage('page-preset-settings');
        });
    }

    // 预设页面点击返回按钮
    const btnBackPreset = document.getElementById('btn-back-preset');
    if (btnBackPreset) {
        btnBackPreset.addEventListener('click', () => {
            switchPage('page-home');
        });
    }

    // 监听“世界书”图标点击
    const btnOpenWorldBook = document.getElementById('btn-open-worldbook');
    if (btnOpenWorldBook) {
        btnOpenWorldBook.addEventListener('click', () => {
            switchPage('page-worldbook');
        });
    }

});
