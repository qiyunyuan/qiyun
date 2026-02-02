// worldview.js
import { switchPage } from './router.js';

// 获取世界书列表
function getWorldBooks() {
    const stored = localStorage.getItem('my_worldbooks_list');
    if (!stored) return [];
    const list = JSON.parse(stored);
    return list.map(item => typeof item === 'string' ? { name: item } : item);
}

// 获取/保存世界观数据
function getWorldviews() {
    const stored = localStorage.getItem('worldviews_data');
    return stored ? JSON.parse(stored) : [];
}

function saveWorldviews(list) {
    localStorage.setItem('worldviews_data', JSON.stringify(list));
}

// 状态变量
let currentEditingId = null;
let tempSelectedBooks = []; // 弹窗里的临时选择
let onSelectorConfirm = null; // 弹窗确定后的回调

export function initWorldview() {
    // 1. 入口
    const btnOpen = document.getElementById('btn-open-worldview');
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            renderWorldviewList();
            // 加载通用设置
            const generalBooks = getGeneralSettings();
            renderTags('display-general-books', generalBooks);
            switchPage('page-worldview');
        });
    }

    // 2. 通用设置 - 添加按钮
    const btnAddGeneral = document.getElementById('btn-add-general-book');
    if (btnAddGeneral) {
        btnAddGeneral.addEventListener('click', () => {
            const current = getGeneralSettings();
            openBookSelector(current, (newSelection) => {
                // 回调：更新显示并保存
                renderTags('display-general-books', newSelection);
                localStorage.setItem('worldview_general_books', JSON.stringify(newSelection));
            });
        });
    }

    // 3. 创建/编辑页 - 添加按钮
    const btnAddCreate = document.getElementById('btn-add-worldview-book');
    if (btnAddCreate) {
        btnAddCreate.addEventListener('click', () => {
            // 从当前DOM读取已有的标签（因为编辑时可能还没保存）
            const current = getTagsFromDisplay('display-worldview-books');
            openBookSelector(current, (newSelection) => {
                renderTags('display-worldview-books', newSelection);
            });
        });
    }

    // 4. 弹窗按钮逻辑
    const btnCancelSelect = document.getElementById('btn-selector-cancel');
    const btnConfirmSelect = document.getElementById('btn-selector-confirm');
    
    if (btnCancelSelect) btnCancelSelect.addEventListener('click', closeSelector);
    if (btnConfirmSelect) btnConfirmSelect.addEventListener('click', () => {
        if (onSelectorConfirm) onSelectorConfirm(tempSelectedBooks);
        closeSelector();
    });

    // 其他常规按钮
    const btnBackHome = document.getElementById('btn-back-from-worldview');
    if (btnBackHome) btnBackHome.addEventListener('click', () => switchPage('page-home'));

    const btnNew = document.getElementById('btn-new-worldview');
    if (btnNew) btnNew.addEventListener('click', () => openEditPage(null));

    const btnBackList = document.getElementById('btn-back-from-create-worldview');
    if (btnBackList) btnBackList.addEventListener('click', () => switchPage('page-worldview'));

    const btnSave = document.getElementById('btn-save-worldview');
    if (btnSave) btnSave.addEventListener('click', handleSave);

    const btnDelete = document.getElementById('btn-delete-worldview');
    if (btnDelete) btnDelete.addEventListener('click', handleDelete);
}

// 获取通用设置
function getGeneralSettings() {
    const saved = localStorage.getItem('worldview_general_books');
    if (saved && !saved.startsWith('[')) return [saved];
    return saved ? JSON.parse(saved) : [];
}

// 渲染标签到显示区域
function renderTags(containerId, tags) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!tags || tags.length === 0) {
        container.innerHTML = '<span style="color:#ccc; font-size:12px; padding:4px;">未选择</span>';
        return;
    }

    tags.forEach(tag => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';
        chip.innerHTML = `
            ${tag}
            <span class="tag-remove">×</span>
        `;
        // 点击叉号删除
        chip.querySelector('.tag-remove').addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡
            const newTags = tags.filter(t => t !== tag);
            renderTags(containerId, newTags);
            
            // 如果是通用设置，删除时也要立即保存
            if (containerId === 'display-general-books') {
                localStorage.setItem('worldview_general_books', JSON.stringify(newTags));
            }
        });
        container.appendChild(chip);
    });
}

// 从显示区域获取当前标签列表 (用于编辑页再次打开弹窗时保持状态)
function getTagsFromDisplay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    // 简单的做法：我们不从DOM读，而是依赖传入的数据。
    // 但为了保险，这里可以通过 data 属性或者重新解析 textContent。
    // 这里为了简化，我们假设调用 openBookSelector 时传入的 current 总是准确的。
    // 实际上，我们在 renderTags 时并没有把数据存回 DOM 的 data 属性，
    // 所以编辑页最好维护一个临时变量，或者直接解析 DOM。
    
    // 解析 DOM 文本 (去掉最后的 '×')
    const chips = container.querySelectorAll('.tag-chip');
    return Array.from(chips).map(chip => chip.innerText.replace(/\n|×/g, '').trim());
}

// 打开选择弹窗
function openBookSelector(currentSelected, callback) {
    const modal = document.getElementById('modal-book-selector');
    const listContainer = document.getElementById('selector-list');
    const books = getWorldBooks();
    
    tempSelectedBooks = [...currentSelected]; // 复制一份
    onSelectorConfirm = callback;

    listContainer.innerHTML = '';
    
    if (books.length === 0) {
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">还没有世界书哦</div>';
    } else {
        books.forEach(book => {
            const item = document.createElement('div');
            item.className = 'selector-item';
            if (tempSelectedBooks.includes(book.name)) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <span>${book.name}</span>
                <span class="check-icon">✔</span>
            `;

            item.addEventListener('click', () => {
                // 切换选中状态
                if (tempSelectedBooks.includes(book.name)) {
                    tempSelectedBooks = tempSelectedBooks.filter(t => t !== book.name);
                    item.classList.remove('selected');
                } else {
                    tempSelectedBooks.push(book.name);
                    item.classList.add('selected');
                }
            });

            listContainer.appendChild(item);
        });
    }

    modal.classList.add('active');
}

function closeSelector() {
    document.getElementById('modal-book-selector').classList.remove('active');
}

// 渲染列表
function renderWorldviewList() {
    const listContainer = document.getElementById('worldview-list');
    const list = getWorldviews();
    listContainer.innerHTML = '';

    if (list.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; color:#ccc; padding:20px;">还没有世界观，快去新建一个吧~</div>';
        return;
    }

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'worldview-item';
        const bookCount = item.worldbookNames ? item.worldbookNames.length : 0;
        const bookInfo = bookCount > 0 ? `<span style="font-size:12px; color:#ff6b81; margin-left:5px;">(${bookCount}本)</span>` : '';

        div.innerHTML = `
            <div class="item-name">${item.name} ${bookInfo}</div>
            <div class="item-desc">${item.description || '暂无描述'}</div>
        `;
        div.addEventListener('click', () => openEditPage(item.id));
        listContainer.appendChild(div);
    });
}

// 打开编辑/新建
function openEditPage(id) {
    currentEditingId = id;
    const title = document.querySelector('#page-worldview-create .title');
    const nameInput = document.getElementById('input-worldview-name');
    const descInput = document.getElementById('input-worldview-desc');
    const btnDelete = document.getElementById('btn-delete-worldview');
    
    let selectedBooks = [];

    if (id) {
        title.textContent = '编辑世界观';
        const list = getWorldviews();
        const item = list.find(i => i.id === id);
        if (item) {
            nameInput.value = item.name;
            descInput.value = item.description;
            if (item.worldbookName) selectedBooks = [item.worldbookName];
            if (item.worldbookNames) selectedBooks = item.worldbookNames;
        }
        btnDelete.style.display = 'block';
    } else {
        title.textContent = '创建世界观';
        nameInput.value = '';
        descInput.value = '';
        selectedBooks = [];
        btnDelete.style.display = 'none';
    }

    // 渲染标签
    renderTags('display-worldview-books', selectedBooks);
    switchPage('page-worldview-create');
}

// 保存
function handleSave() {
    const name = document.getElementById('input-worldview-name').value.trim();
    const desc = document.getElementById('input-worldview-desc').value.trim();
    
    // 从显示区域获取最终的标签列表
    const selectedBooks = getTagsFromDisplay('display-worldview-books');

    if (!name) {
        alert('宝宝，名字还没写呢！');
        return;
    }

    let list = getWorldviews();

    if (currentEditingId) {
        const index = list.findIndex(i => i.id === currentEditingId);
        if (index !== -1) {
            list[index] = { 
                ...list[index], 
                name, 
                description: desc, 
                worldbookNames: selectedBooks 
            };
        }
    } else {
        const newId = 'wv_' + Date.now();
        list.push({ 
            id: newId, 
            name, 
            description: desc, 
            worldbookNames: selectedBooks 
        });
    }

    saveWorldviews(list);
    renderWorldviewList();
    switchPage('page-worldview');
}

// 删除
function handleDelete() {
    if (!currentEditingId) return;
    if (confirm('确定要删除这个世界观吗？')) {
        let list = getWorldviews();
        list = list.filter(i => i.id !== currentEditingId);
        saveWorldviews(list);
        renderWorldviewList();
        switchPage('page-worldview');
    }
}
