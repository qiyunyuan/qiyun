import { switchPage } from './router.js';

// 存储面具数据
let masks = [];
// 当前正在编辑的面具ID (null 表示新建)
let currentEditingId = null;

/**
 * 初始化面具模块
 */
export function initMask() {
    // 1. 加载数据
    loadMasks();

    // 2. 绑定事件
    bindEvents();

    // 3. 渲染列表
    renderMaskList();
}

/**
 * 加载本地存储的面具数据
 */
function loadMasks() {
    const saved = localStorage.getItem('masks');
    if (saved) {
        masks = JSON.parse(saved);
    } else {
        masks = [];
    }
}

/**
 * 保存数据到本地
 */
function saveMasksToLocal() {
    localStorage.setItem('masks', JSON.stringify(masks));
}

/**
 * 绑定所有按钮事件
 */
function bindEvents() {
    // --- 列表页 ---
    
    // 1. 主页 -> 面具列表
    const btnOpenMasks = document.getElementById('btn-open-masks');
    if (btnOpenMasks) {
        btnOpenMasks.addEventListener('click', () => {
            renderMaskList(); // 每次进来都刷新一下
            switchPage('page-masks');
        });
    }

    // 2. 面具列表 -> 返回主页
    const btnBackHome = document.getElementById('btn-back-home-from-masks');
    if (btnBackHome) {
        btnBackHome.addEventListener('click', () => {
            switchPage('page-home');
        });
    }

    // 3. 新建面具 -> 进入编辑页
    const btnNewMask = document.getElementById('btn-new-mask');
    if (btnNewMask) {
        btnNewMask.addEventListener('click', () => {
            openEditPage(null); // null 表示新建
        });
    }

    // --- 编辑页 ---

    // 4. 编辑页 -> 返回列表 (不保存)
    const btnBackMasks = document.getElementById('btn-back-masks');
    if (btnBackMasks) {
        btnBackMasks.addEventListener('click', () => {
            switchPage('page-masks');
        });
    }

    // 5. 点击头像 -> 触发文件上传
    const avatarWrapper = document.getElementById('mask-avatar-wrapper');
    const avatarInput = document.getElementById('mask-avatar-input');
    if (avatarWrapper && avatarInput) {
        avatarWrapper.addEventListener('click', () => {
            avatarInput.click();
        });

        // 监听文件选择
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // 把图片显示在圆圈里
                    avatarWrapper.style.backgroundImage = `url(${event.target.result})`;
                    avatarWrapper.style.backgroundSize = 'cover';
                    avatarWrapper.innerHTML = ''; // 清掉“头像”两个字
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 6. 保存按钮
    const btnSave = document.getElementById('btn-save-mask');
    if (btnSave) {
        btnSave.addEventListener('click', saveCurrentMask);
    }

    // 7. 删除按钮
    const btnDelete = document.getElementById('btn-delete-mask-action');
    if (btnDelete) {
        btnDelete.addEventListener('click', deleteCurrentMask);
    }
}

/**
 * 打开编辑页面
 * @param {string|null} maskId - 面具ID，如果是 null 则为新建
 */
function openEditPage(maskId) {
    currentEditingId = maskId;
    
    // 获取DOM元素
    const nameInput = document.getElementById('mask-name-input');
    const remarkInput = document.getElementById('mask-remark-input');
    const descInput = document.getElementById('mask-desc-input');
    const avatarWrapper = document.getElementById('mask-avatar-wrapper');
    const avatarInput = document.getElementById('mask-avatar-input');

    // 清空文件输入框，防止重复触发change
    if (avatarInput) avatarInput.value = '';

    if (maskId === null) {
        // === 新建模式 ===
        // 清空表单
        nameInput.value = '';
        remarkInput.value = '';
        descInput.value = '';
        // 重置头像
        avatarWrapper.style.backgroundImage = '';
        avatarWrapper.innerHTML = '<span>头像</span>';
    } else {
        // === 编辑模式 ===
        // 找到对应的数据
        const mask = masks.find(m => m.id === maskId);
        if (mask) {
            nameInput.value = mask.name || '';
            remarkInput.value = mask.remark || '';
            descInput.value = mask.description || '';
            
            if (mask.avatar) {
                avatarWrapper.style.backgroundImage = `url(${mask.avatar})`;
                avatarWrapper.style.backgroundSize = 'cover';
                avatarWrapper.innerHTML = '';
            } else {
                avatarWrapper.style.backgroundImage = '';
                avatarWrapper.innerHTML = '<span>头像</span>';
            }
        }
    }

    switchPage('page-mask-edit');
}

/**
 * 保存当前面具
 */
function saveCurrentMask() {
    const nameInput = document.getElementById('mask-name-input');
    const remarkInput = document.getElementById('mask-remark-input');
    const descInput = document.getElementById('mask-desc-input');
    const avatarWrapper = document.getElementById('mask-avatar-wrapper');

    const name = nameInput.value.trim();
    if (!name) {
        alert('宝宝，起个名字再保存嘛~');
        return;
    }

    // 获取头像数据 (从背景图样式里提取 Base64)
    let avatarData = '';
    if (avatarWrapper.style.backgroundImage) {
        // 样式是 url("...")，我们需要去掉 url(" 和 ")
        avatarData = avatarWrapper.style.backgroundImage.slice(5, -2);
    }

    const maskData = {
        id: currentEditingId || Date.now().toString(), // 如果是新建，生成一个时间戳ID
        name: name,
        remark: remarkInput.value.trim(),
        description: descInput.value.trim(),
        avatar: avatarData
    };

    if (currentEditingId) {
        // 更新现有
        const index = masks.findIndex(m => m.id === currentEditingId);
        if (index !== -1) {
            masks[index] = maskData;
        }
    } else {
        // 新增
        masks.push(maskData);
    }

    saveMasksToLocal();
    renderMaskList();
    switchPage('page-masks');
}

/**
 * 删除当前面具
 */
function deleteCurrentMask() {
    if (!currentEditingId) {
        // 如果是新建状态点击删除，直接返回列表即可
        switchPage('page-masks');
        return;
    }

    if (confirm('确定要删除这个面具吗？')) {
        masks = masks.filter(m => m.id !== currentEditingId);
        saveMasksToLocal();
        renderMaskList();
        switchPage('page-masks');
    }
}

/**
 * 渲染面具列表
 */
function renderMaskList() {
    const listContainer = document.querySelector('.mask-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // 清空列表

    if (masks.length === 0) {
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">还没有面具哦，新建一个吧~</div>';
        return;
    }

    masks.forEach(mask => {
        const item = document.createElement('div');
        item.className = 'mask-item';
        
        // 头像样式
        let avatarStyle = '';
        if (mask.avatar) {
            avatarStyle = `background-image: url(${mask.avatar});`;
        }

        item.innerHTML = `
            <div class="mask-avatar-preview" style="${avatarStyle}"></div>
            <div class="mask-info">
                <div class="mask-remark">${mask.remark || '无备注'}</div>
                <div class="mask-name">${mask.name}</div>
            </div>
            <div class="mask-arrow">›</div>
        `;

        // 点击进入编辑
        item.addEventListener('click', () => {
            openEditPage(mask.id);
        });

        listContainer.appendChild(item);
    });
}
