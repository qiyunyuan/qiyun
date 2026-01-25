/**
 * 美化设置逻辑
 * 核心功能：图片压缩、双模式输入、配置保存
 */

// 默认配置
const DEFAULT_CONFIG = {
    avatar: '', // 头像
    nickname: '祁韵', // 昵称
    bio: '我想要暖暖的幸福', // 个性签名
    wallpaper: '', // 背景壁纸
    sliders: ['', '', ''], // 3张轮播图
    apps: [ // 6个APP图标和名称
        { name: 'APP', icon: '' },
        { name: 'APP', icon: '' },
        { name: 'APP', icon: '' },
        { name: 'APP', icon: '' },
        { name: '设置', icon: '' },
        { name: 'APP', icon: '' }
    ]
};

// 当前暂存配置
let currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

/**
 * 初始化入口
 */
export function initBeautify() {
    loadBeautifySettings(); // 加载并应用
    setupInteractions();    // 绑定新交互
}

/**
 * 加载并应用设置
 */
export function loadBeautifySettings() {
    const saved = localStorage.getItem('beautify_config');
    if (saved) {
        try {
            currentConfig = JSON.parse(saved);
        } catch (e) {
            console.error('配置解析失败', e);
            currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        }
    }
    applyTheme(currentConfig);
    updatePreviews(currentConfig); // 更新所有预览图
    updateTextInputs(currentConfig); // 更新文本框
}

/**
 * 将配置应用到主页
 */
function applyTheme(config) {
    // 1. 个人资料
    const avatarEl = document.querySelector('.avatar');
    if (avatarEl) avatarEl.style.backgroundImage = config.avatar ? `url('${config.avatar}')` : '';

    const nicknameEl = document.querySelector('.nickname');
    if (nicknameEl) nicknameEl.textContent = config.nickname || '祁韵';

    const bioEl = document.querySelector('.bio');
    if (bioEl) bioEl.textContent = config.bio || '我想要暖暖的幸福';

    // 2. 壁纸
    const homePage = document.getElementById('page-home');
    if (homePage) {
        if (config.wallpaper) {
            homePage.style.backgroundImage = `url('${config.wallpaper}')`;
            homePage.style.backgroundSize = 'cover';
            homePage.style.backgroundPosition = 'center';
        } else {
            homePage.style.backgroundImage = '';
        }
    }

    // 3. 轮播图
    const sliders = document.querySelectorAll('.slider-item');
    sliders.forEach((slide, index) => {
        if (config.sliders[index]) {
            slide.style.backgroundImage = `url('${config.sliders[index]}')`;
            slide.style.backgroundColor = 'transparent';
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
        } else {
            slide.style.backgroundImage = '';
            slide.style.backgroundColor = ['#e0e0e0', '#d0d0d0', '#c0c0c0'][index] || '#ccc';
        }
    });

    // 4. APP图标
    const appItems = document.querySelectorAll('.app-item');
    appItems.forEach((item, index) => {
        if (index < config.apps.length) {
            const app = config.apps[index];
            const nameEl = item.querySelector('.app-name');
            const iconEl = item.querySelector('.app-icon');
            
            if (nameEl) nameEl.textContent = app.name;
            if (iconEl) {
                iconEl.style.backgroundImage = app.icon ? `url('${app.icon}')` : '';
                iconEl.style.backgroundSize = 'cover';
                iconEl.style.backgroundPosition = 'center';
            }
        }
    });
}

/**
 * 绑定所有交互事件
 */
function setupInteractions() {
    // 1. 绑定“链接”按钮 -> 显示输入框
    document.querySelectorAll('.link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target'); // 对应的 input ID
            const containerId = 'container-' + targetId;
            const container = document.getElementById(containerId);
            
            // 切换显示
            if (container) {
                // 如果当前是隐藏的，就显示出来；如果是显示的，就隐藏
                if (container.classList.contains('show')) {
                    container.classList.remove('show');
                } else {
                    // 隐藏所有其他输入框，保持界面整洁
                    document.querySelectorAll('.url-input-container').forEach(el => el.classList.remove('show'));
                    container.classList.add('show');
                }
            }
        });
    });

    // 2. 绑定“相册”按钮 -> 触发文件选择
    document.querySelectorAll('.file-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target'); // 对应的 file input ID
            const fileInput = document.getElementById(targetId);
            if (fileInput) fileInput.click();
        });
    });

    // 3. 监听 URL 输入框的变化 -> 实时预览
    document.querySelectorAll('.url-input-container .form-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            const key = input.id.replace('url-', ''); // 提取 key，如 avatar, wallpaper, slider-0
            updateConfigValue(key, val);
            updateSinglePreview(key, val);
        });
    });

    // 4. 监听 文件选择 的变化 -> 压缩并预览
    document.querySelectorAll('.hidden-file-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 压缩图片
            try {
                const compressedBase64 = await compressImage(file);
                const key = input.id.replace('file-', '');
                updateConfigValue(key, compressedBase64);
                updateSinglePreview(key, compressedBase64);
                
                // 清空对应的 URL 输入框（避免混淆）
                const urlInput = document.getElementById('url-' + key);
                if (urlInput) {
                    urlInput.value = '';
                    // 也可以选择隐藏输入框
                    const container = document.getElementById('container-url-' + key);
                    if (container) container.classList.remove('show');
                }
            } catch (err) {
                console.error('压缩失败', err);
                alert('图片处理失败，请重试');
            }
        });
    });

    // 5. 文本输入绑定 (昵称、签名、APP名称)
    bindText('input-nickname', 'nickname');
    bindText('input-bio', 'bio');
    // APP名称
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`input-app-name-${i}`);
        if (input) {
            input.addEventListener('input', (e) => {
                currentConfig.apps[i].name = e.target.value;
            });
        }
    }

    // 6. 保存与重置
    const btnSave = document.getElementById('btn-save-beautify');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            try {
                localStorage.setItem('beautify_config', JSON.stringify(currentConfig));
                applyTheme(currentConfig);
                alert('设置已保存！');
            } catch (e) {
                alert('保存失败：可能是图片数据过大，建议减少大图数量或使用链接。');
                console.error(e);
            }
        });
    }

    const btnReset = document.getElementById('btn-reset-beautify');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('确定要恢复默认设置吗？所有自定义内容将丢失。')) {
                localStorage.removeItem('beautify_config');
                currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
                applyTheme(currentConfig);
                updatePreviews(currentConfig);
                updateTextInputs(currentConfig);
            }
        });
    }
}

/**
 * 辅助：更新配置值
 * key 格式: 'avatar', 'wallpaper', 'slider-0', 'app-0'
 */
function updateConfigValue(key, value) {
    if (key.startsWith('slider-')) {
        const index = parseInt(key.split('-')[1]);
        currentConfig.sliders[index] = value;
    } else if (key.startsWith('app-')) {
        const index = parseInt(key.split('-')[1]);
        currentConfig.apps[index].icon = value;
    } else {
        currentConfig[key] = value;
    }
}

/**
 * 辅助：更新单个预览图
 */
function updateSinglePreview(key, src) {
    const previewId = 'preview-' + key;
    const el = document.getElementById(previewId);
    if (el) {
        el.style.backgroundImage = src ? `url('${src}')` : '';
    }
}

/**
 * 辅助：绑定简单文本输入
 */
function bindText(id, key) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', (e) => {
            currentConfig[key] = e.target.value;
        });
    }
}

/**
 * 核心功能：图片压缩
 * 将大图压缩到宽/高不超过 1024px，质量 0.7
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 限制最大尺寸
                const MAX_SIZE = 1024;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 导出为 JPEG，质量 0.7
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedDataUrl);
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
}

/**
 * 批量更新页面上的预览图 (初始化时用)
 */
function updatePreviews(config) {
    updateSinglePreview('avatar', config.avatar);
    updateSinglePreview('wallpaper', config.wallpaper);
    
    config.sliders.forEach((src, i) => {
        updateSinglePreview(`slider-${i}`, src);
    });
    
    config.apps.forEach((app, i) => {
        updateSinglePreview(`app-${i}`, app.icon);
    });
}

/**
 * 批量更新页面上的文本框 (初始化时用)
 */
function updateTextInputs(config) {
    const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v || '';
    };

    setVal('input-nickname', config.nickname);
    setVal('input-bio', config.bio);
    
    // 如果图片是 URL 形式，回填到输入框
    const trySetUrl = (key, src) => {
        if (src && src.startsWith('http')) {
            setVal('url-' + key, src);
        }
    };

    trySetUrl('avatar', config.avatar);
    trySetUrl('wallpaper', config.wallpaper);
    
    config.sliders.forEach((src, i) => trySetUrl(`slider-${i}`, src));
    config.apps.forEach((app, i) => {
        setVal(`input-app-name-${i}`, app.name);
        trySetUrl(`app-${i}`, app.icon);
    });
}
