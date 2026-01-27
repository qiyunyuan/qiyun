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

        // --- 面具功能区 ---

    // 1. 主页点击“面具”图标 -> 进入面具列表
    const btnOpenMasks = document.getElementById('btn-open-masks');
    if (btnOpenMasks) {
        btnOpenMasks.addEventListener('click', () => {
            switchPage('page-masks');
        });
    }

    // 2. 面具列表点击“返回” -> 回主页
    const btnBackHomeFromMasks = document.getElementById('btn-back-home-from-masks');
    if (btnBackHomeFromMasks) {
        btnBackHomeFromMasks.addEventListener('click', () => {
            switchPage('page-home');
        });
    }

    // 3. 面具列表点击“新建” -> 进入编辑页
    const btnNewMask = document.getElementById('btn-new-mask');
    if (btnNewMask) {
        btnNewMask.addEventListener('click', () => {
            // 这里以后可以加清空表单的逻辑
            switchPage('page-mask-edit');
        });
    }

    // 4. 编辑页点击“返回” -> 回面具列表
    const btnBackMasks = document.getElementById('btn-back-masks');
    if (btnBackMasks) {
        btnBackMasks.addEventListener('click', () => {
            switchPage('page-masks');
        });
    }

    // 5. 示例：点击列表里的某一项也能进编辑页
    const demoMaskItem = document.getElementById('mask-demo-1');
    if (demoMaskItem) {
        demoMaskItem.addEventListener('click', () => {
            switchPage('page-mask-edit');
        });
    }

});

