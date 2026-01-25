import { switchPage } from './router.js';
import { initApiSettings } from './api.js';
import { initBeautify } from './beautify.js';
import { initPreset } from './preset.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化 API 模块
    initApiSettings();

    // 初始化美化设置模块 (应用已保存的主题)
    initBeautify();

    // 初始化预设模块
    initPreset();

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

    // 监听“API 设置”按钮点击 (进入API设置页)
    const btnOpenApi = document.getElementById('btn-open-api');
    if (btnOpenApi) {
        btnOpenApi.addEventListener('click', () => {
            switchPage('page-api-settings');
        });
    }

    // 监听“API 设置”页面的返回按钮 (返回设置页)
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

    // 1. 主页点击“预设”图标
    const btnOpenPreset = document.getElementById('btn-open-preset');
    if (btnOpenPreset) {
        btnOpenPreset.addEventListener('click', () => {
            switchPage('page-preset-settings');
        });
    }

    // 2. 预设页面点击返回按钮
    const btnBackPreset = document.getElementById('btn-back-preset');
    if (btnBackPreset) {
        btnBackPreset.addEventListener('click', () => {
            switchPage('page-home'); // 这里看你是想返回主页还是设置页，通常预设在主页入口，所以返回主页
        });
    }
});

