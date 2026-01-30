import { switchPage } from './router.js';

export function initWorldBook() {
    // ★ 加在最上面，用来记住当前正在看哪本书
    let currentBookName = ''; 

    // 1. 路由跳转逻辑
    const btnBack = document.getElementById('btn-back-worldbook');
    if (btnBack) btnBack.addEventListener('click', () => switchPage('page-home'));

    const btnGlobal = document.getElementById('btn-wb-global');
    if (btnGlobal) btnGlobal.addEventListener('click', () => switchPage('page-worldbook-global'));

    const btnBackGlobal = document.getElementById('btn-back-wb-global');
    if (btnBackGlobal) btnBackGlobal.addEventListener('click', () => switchPage('page-worldbook'));

       // 条目页面的返回逻辑
    const btnBackEntry = document.getElementById('btn-back-wb-entry');
        if (btnBackEntry) btnBackEntry.addEventListener('click', () => switchPage('page-worldbook'));



    // 2. 弹窗与列表逻辑
    const btnNewWb = document.getElementById('btn-new-wb');
    const btnNewTag = document.getElementById('btn-new-tag'); // 新增
    
    // 世界书弹窗元素
    const modalWb = document.getElementById('modal-new-wb');
    const btnCancelWb = document.getElementById('btn-cancel-wb');
    const btnConfirmWb = document.getElementById('btn-confirm-wb');
    const inputWbName = document.getElementById('input-wb-name');
    const modalTagList = document.getElementById('modal-tag-list'); // 弹窗里的标签列表
    
    // 标签弹窗元素
    const modalTag = document.getElementById('modal-new-tag');
    const btnCancelTag = document.getElementById('btn-cancel-tag');
    const btnConfirmTag = document.getElementById('btn-confirm-tag');
    const inputTagName = document.getElementById('input-tag-name');

    const listContainer = document.getElementById('wb-list');
    const tagBarContainer = document.getElementById('wb-tag-bar'); // 顶部的标签栏
    const modalTitle = modalWb.querySelector('.modal-title');

    let currentEditingItem = null; // 当前正在编辑的世界书 DOM
    let currentSelectedTagInModal = '默认'; // 弹窗里选中的标签
    let currentFilterTag = '全部'; // 顶部当前筛选的标签

    // ===========================
    // ★ 核心数据操作
    // ===========================

    // 获取所有标签
    function getTags() {
        const saved = localStorage.getItem('my_wb_tags');
        return saved ? JSON.parse(saved) : ['默认'];
    }

    // 保存标签
    function saveTags(tags) {
        localStorage.setItem('my_wb_tags', JSON.stringify(tags));
    }

    // 保存世界书列表 (结构: {name:Str, tag:Str})
    function saveWorldBooks() {
        const books = [];
        const items = listContainer.querySelectorAll('.wb-item');
        items.forEach(item => {
            books.push({
                name: item.querySelector('.wb-name').textContent,
                tag: item.dataset.tag || '默认'
            });
        });
        localStorage.setItem('my_worldbooks_list', JSON.stringify(books));
    }

    // 加载世界书列表
    function loadWorldBooks() {
        const saved = localStorage.getItem('my_worldbooks_list');
        listContainer.innerHTML = ''; // 清空
        
        if (saved) {
            const books = JSON.parse(saved);
            books.forEach(book => {
                // 兼容旧数据：如果是字符串，就转成对象
                if (typeof book === 'string') {
                    addWorldBookItem(book, '默认', false);
                } else {
                    addWorldBookItem(book.name, book.tag, false);
                }
            });
        }
        filterListByTag(currentFilterTag); // 加载完筛选一下
    }

    // ===========================
    // ★ 标签栏逻辑 (顶部)
    // ===========================
    
    // ===========================
    // ★ 标签栏逻辑 (顶部) - 已更新删除功能
    // ===========================
    
    function renderTagBar() {
        // 获取最新标签列表
        const customTags = getTags(); 
        // 组合显示：全部 + (默认+自定义)
        // 注意：这里为了逻辑简单，我们把'默认'也视为普通标签渲染，但'全部'是特殊的
        const displayTags = ['全部', ...customTags];
        
        tagBarContainer.innerHTML = '';
        
        displayTags.forEach(tag => {
            const div = document.createElement('div');
            div.className = `wb-tag ${tag === currentFilterTag ? 'active' : ''}`;
            
            // 标签名文本
            const spanName = document.createElement('span');
            spanName.textContent = tag;
            div.appendChild(spanName);

            // ★ 只有不是“全部”且不是“默认”的标签，才显示删除按钮
            if (tag !== '全部' && tag !== '默认') {
                const btnDel = document.createElement('span');
                btnDel.className = 'tag-del-btn';
                btnDel.textContent = '×';
                
                // 删除事件
                btnDel.addEventListener('click', (e) => {
                    e.stopPropagation(); // 防止触发标签切换
                    
                    if (confirm(`确定要删除标签【${tag}】吗？\n该标签下的世界书将移动到“默认”标签。`)) {
                        // 1. 从标签列表中移除
                        const newTags = customTags.filter(t => t !== tag);
                        saveTags(newTags);

                        // 2. 把该标签下的书移动到 '默认'
                        const items = listContainer.querySelectorAll('.wb-item');
                        let hasChange = false;
                        items.forEach(item => {
                            if (item.dataset.tag === tag) {
                                item.dataset.tag = '默认';
                                hasChange = true;
                            }
                        });
                        
                        if (hasChange) {
                            saveWorldBooks(); // 保存书籍变更
                        }

                        // 3. 如果当前正看着这个标签，就切回“全部”
                        if (currentFilterTag === tag) {
                            currentFilterTag = '全部';
                        }

                        // 4. 刷新界面
                        renderTagBar();
                        filterListByTag(currentFilterTag);
                    }
                });
                div.appendChild(btnDel);
            }

            // 点击标签切换筛选
            div.addEventListener('click', () => {
                document.querySelectorAll('.wb-tag').forEach(t => t.classList.remove('active'));
                div.classList.add('active');
                currentFilterTag = tag;
                filterListByTag(tag);
            });
            
            tagBarContainer.appendChild(div);
        });
    }

    // 根据标签筛选列表显示
    function filterListByTag(tag) {
        const items = listContainer.querySelectorAll('.wb-item');
        items.forEach(item => {
            const itemTag = item.dataset.tag || '默认';
            if (tag === '全部' || itemTag === tag) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // ===========================
    // ★ 新建标签 弹窗逻辑
    // ===========================

    if (btnNewTag) {
        btnNewTag.addEventListener('click', () => {
            inputTagName.value = '';
            modalTag.classList.add('active');
            inputTagName.focus();
        });
    }

    if (btnCancelTag) btnCancelTag.addEventListener('click', () => modalTag.classList.remove('active'));

    if (btnConfirmTag) {
        btnConfirmTag.addEventListener('click', () => {
            const newTag = inputTagName.value.trim();
            if (newTag) {
                const tags = getTags();
                if (!tags.includes(newTag)) {
                    tags.push(newTag);
                    saveTags(tags);
                    renderTagBar(); // 刷新顶部
                }
                modalTag.classList.remove('active');
            }
        });
    }

    // ===========================
    // ★ 新建/编辑 世界书 弹窗逻辑
    // ===========================

    // 渲染弹窗里的标签选择器
    function renderModalTags(selectedTag) {
        const tags = getTags();
        modalTagList.innerHTML = '';
        currentSelectedTagInModal = selectedTag || '默认'; // 重置选中

        tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = `modal-tag-option ${tag === currentSelectedTagInModal ? 'active' : ''}`;
            span.textContent = tag;
            span.addEventListener('click', () => {
                // 切换选中状态
                modalTagList.querySelectorAll('.modal-tag-option').forEach(t => t.classList.remove('active'));
                span.classList.add('active');
                currentSelectedTagInModal = tag;
            });
            modalTagList.appendChild(span);
        });
    }

    const openWbModal = (item = null) => {
        currentEditingItem = item;
        modalWb.classList.add('active');
        
        if (item) {
            modalTitle.textContent = "编辑世界书";
            inputWbName.value = item.querySelector('.wb-name').textContent;
            // 获取当前条目的标签并选中
            renderModalTags(item.dataset.tag);
        } else {
            modalTitle.textContent = "新建世界书";
            inputWbName.value = '';
            // 默认选中当前筛选的标签（如果不是全部），或者是默认
            const defaultSelect = (currentFilterTag !== '全部') ? currentFilterTag : '默认';
            renderModalTags(defaultSelect);
        }
        inputWbName.focus();
    };

    const closeWbModal = () => {
        modalWb.classList.remove('active');
        currentEditingItem = null;
    };

    if (btnNewWb) btnNewWb.addEventListener('click', () => openWbModal(null));
    if (btnCancelWb) btnCancelWb.addEventListener('click', closeWbModal);

    // 确认按钮逻辑 (新建 或 编辑)
    if (btnConfirmWb) {
        btnConfirmWb.addEventListener('click', () => {
            const name = inputWbName.value.trim();
            if (!name) return; 

            if (currentEditingItem) {
                // === 编辑逻辑 ===
                const oldName = currentEditingItem.querySelector('.wb-name').textContent;
                
                // 更新 UI
                currentEditingItem.querySelector('.wb-name').textContent = name;
                currentEditingItem.dataset.tag = currentSelectedTagInModal; // 更新标签数据
                
                // 数据搬家 (如果改名了)
                if (oldName !== name) {
                    const oldData = localStorage.getItem('wb_data_' + oldName);
                    if (oldData) {
                        localStorage.setItem('wb_data_' + name, oldData);
                        localStorage.removeItem('wb_data_' + oldName);
                    }
                }
                saveWorldBooks();
                // 编辑完可能因为标签变了而消失（如果当前筛选不是全部），这里选择刷新一下筛选
                filterListByTag(currentFilterTag);

            } else {
                // === 新建逻辑 ===
                addWorldBookItem(name, currentSelectedTagInModal);
            }
            closeWbModal();
        });
    }

    // 添加列表项函数
    function addWorldBookItem(name, tag = '默认', shouldSave = true) {
        const item = document.createElement('div');
        item.className = 'wb-item';
        item.dataset.tag = tag; // ★ 把标签存在 DOM 上
        
        item.innerHTML = `
            <span class="wb-name">${name}</span>
            <div class="wb-actions">
                <button class="wb-action-btn btn-rename">编辑</button> <!-- 改成了编辑 -->
                <button class="wb-action-btn btn-delete">删除</button>
            </div>
        `;

        // 编辑按钮
        const btnEdit = item.querySelector('.btn-rename');
        btnEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            openWbModal(item);
        });

        // 删除按钮
        const btnDelete = item.querySelector('.btn-delete');
        btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            const nameToDelete = item.querySelector('.wb-name').textContent;
            if(confirm(`确定要删除《${nameToDelete}》吗？`)) {
                localStorage.removeItem('wb_data_' + nameToDelete);
                item.remove();
                saveWorldBooks();
            }
        });

        // 点击进入
        item.addEventListener('click', () => {
            const name = item.querySelector('.wb-name').textContent;
            currentBookName = name;
            const titleEl = document.getElementById('wb-entry-title');
            if (titleEl) titleEl.textContent = name;
            document.getElementById('wb-entry-list').innerHTML = ''; 
            loadAllEntries(); 
            switchPage('page-worldbook-entry');
        });

        listContainer.appendChild(item);
        
        if (shouldSave) {
            saveWorldBooks();
            // 新建后，如果当前筛选的标签不匹配，可能需要切换或者提示，这里简单处理：
            // 如果是在“全部”或者当前标签下新建，能看到；否则会被过滤掉。
            // 我们手动触发一次筛选刷新
            filterListByTag(currentFilterTag);
        }
    }

    // ★ 初始化
    renderTagBar();
    loadWorldBooks();

    // --- 编辑页逻辑 ---
    
    // 1. 跳转逻辑：从列表点进去
    // 暂时先写返回逻辑
    const btnBackEdit = document.getElementById('btn-back-wb-edit');
    if (btnBackEdit) {
        btnBackEdit.addEventListener('click', () => {
            // 返回到列表页（这里假设列表页ID是 page-worldbook-entry，如果不是你自己改一下）
            // 实际上你之前的代码里列表是在 page-worldbook-entry
            switchPage('page-worldbook-entry'); 
        });
    }

    // 2. 策略改变时，显示/隐藏深度输入框
    const selectStrategy = document.getElementById('wb-select-strategy');
    const groupDepth = document.getElementById('group-wb-depth');
    
    if (selectStrategy && groupDepth) {
        selectStrategy.addEventListener('change', (e) => {
            if (e.target.value === 'depth') {
                groupDepth.style.display = 'flex';
            } else {
                groupDepth.style.display = 'none';
            }
        });
    }

    // 3. 简单的词符计算 (这里简单按字数算，你可以以后换成 tokenizer)
    const inputContent = document.getElementById('wb-input-content');
    const tokenNumDisplay = document.getElementById('wb-token-num');
    
    if (inputContent && tokenNumDisplay) {
        inputContent.addEventListener('input', () => {
            tokenNumDisplay.textContent = inputContent.value.length;
        });
    }
    
    // 4. 保存按钮 - 具体逻辑在下方实现，保留占位注释

// ... (前面的代码) ...

    // --- 条目列表页逻辑 ---

    // ★ 1. 在这里加一个变量，用来记录当前正在编辑的是哪个条目（如果是新建就是 null）
    let currentEditingEntryId = null; 

    // 点击“新建”按钮
    const btnNewEntryContent = document.getElementById('btn-new-entry-content');
    if (btnNewEntryContent) {
        btnNewEntryContent.addEventListener('click', () => {
            // 清空输入框
            document.getElementById('wb-input-title').value = '';
            document.getElementById('wb-input-keys').value = '';
            document.getElementById('wb-input-content').value = '';
            
            // ★ 标记为新建模式
            currentEditingEntryId = null;
            
            switchPage('page-worldbook-edit');
        });
    }

    // ★ 2. 核心：保存按钮逻辑
    const btnSaveWb = document.getElementById('btn-save-wb');
    const entryListContainer = document.getElementById('wb-entry-list');

    if (btnSaveWb) {
        btnSaveWb.addEventListener('click', () => {
            // 1. 获取输入内容
            const title = document.getElementById('wb-input-title').value.trim() || '未命名条目';
            const keys = document.getElementById('wb-input-keys').value;
            const content = document.getElementById('wb-input-content').value;
            
            // ★【修复点1】获取“状态”下拉框
            const statusSelect = document.getElementById('wb-select-status');
            const statusValue = statusSelect ? statusSelect.value : 'permanent'; 

            // 获取“插入位置”策略
            const strategySelect = document.getElementById('wb-select-strategy');
            const strategy = strategySelect ? strategySelect.value : 'depth'; 

            // ★【修复点2】判断是否绿灯
            const isKeyword = (statusValue === 'keyword');

            if (currentEditingEntryId) {
                // === 修改旧条目 ===
                const existingItem = document.getElementById(currentEditingEntryId);
                if (existingItem) {
                    existingItem.querySelector('.entry-title').textContent = title;
                    
                    const dot = existingItem.querySelector('.status-dot');
                    if (isKeyword) dot.classList.add('type-keyword');
                    else dot.classList.remove('type-keyword');

                    existingItem.dataset.keys = keys;
                    existingItem.dataset.content = content;
                    existingItem.dataset.strategy = strategy;
                    existingItem.dataset.status = statusValue;
                }
            } else {
                // === 新建新条目 ===
                const newId = 'entry-' + Date.now();
                const item = document.createElement('div');
                item.className = 'entry-item';
                item.id = newId;
                
                item.dataset.keys = keys;
                item.dataset.content = content;
                item.dataset.strategy = strategy;
                item.dataset.status = statusValue;

                const dotClass = isKeyword ? 'status-dot type-keyword' : 'status-dot';

                item.innerHTML = `
                    <div class="entry-left">
                        <div class="capsule-switch active"></div>
                        <div class="${dotClass}"></div>
                        <div class="entry-title">${title}</div>
                    </div>
                    <div class="entry-actions">
                        <button class="entry-btn btn-edit-entry">编辑</button>
                        <button class="entry-btn btn-del-entry">删除</button>
                    </div>
                `;

                // --- 绑定事件 ---
                const switchBtn = item.querySelector('.capsule-switch');
                switchBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    switchBtn.classList.toggle('active');
                    saveAllEntries(); // ★ 开关也要保存
                });

                item.querySelector('.btn-del-entry').addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.remove();
                    saveAllEntries(); // ★ 删除也要保存
                });

                item.querySelector('.btn-edit-entry').addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    document.getElementById('wb-input-title').value = item.querySelector('.entry-title').textContent;
                    document.getElementById('wb-input-keys').value = item.dataset.keys || '';
                    document.getElementById('wb-input-content').value = item.dataset.content || '';
                    
                    if (statusSelect) statusSelect.value = item.dataset.status || 'permanent';

                    if (strategySelect) {
                        strategySelect.value = item.dataset.strategy || 'depth';
                        strategySelect.dispatchEvent(new Event('change'));
                    }

                    currentEditingEntryId = newId;
                    switchPage('page-worldbook-edit');
                });

                if (entryListContainer) entryListContainer.appendChild(item);
            }

            // ★★★ 重点在这里！这一句必须在花括号里面！ ★★★
            saveAllEntries(); 
            
            switchPage('page-worldbook-entry');
        });
    }

        // ============================
    // ★ 新增：自动存档/读档功能
    // ============================

    // 1. 定义一个“渲染条目”的函数（用来恢复显示）
    function renderEntryElement(data) {
        const item = document.createElement('div');
        item.className = 'entry-item';
        item.id = data.id;
        
        // 恢复数据
        item.dataset.keys = data.keys;
        item.dataset.content = data.content;
        item.dataset.strategy = data.strategy;
        item.dataset.status = data.status;

        const isKeyword = (data.status === 'keyword');
        const dotClass = isKeyword ? 'status-dot type-keyword' : 'status-dot';
        const switchClass = data.isActive ? 'capsule-switch active' : 'capsule-switch';

        item.innerHTML = `
            <div class="entry-left">
                <div class="${switchClass}"></div>
                <div class="${dotClass}"></div>
                <div class="entry-title">${data.title}</div>
            </div>
            <div class="entry-actions">
                <button class="entry-btn btn-edit-entry">编辑</button>
                <button class="entry-btn btn-del-entry">删除</button>
            </div>
        `;

        // 重新绑定事件（和之前一样）
        const switchBtn = item.querySelector('.capsule-switch');
        switchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            switchBtn.classList.toggle('active');
            saveAllEntries(); // ★ 开关也要保存
        });

        item.querySelector('.btn-del-entry').addEventListener('click', (e) => {
            e.stopPropagation();
            item.remove();
            saveAllEntries(); // ★ 删除也要保存
        });

        item.querySelector('.btn-edit-entry').addEventListener('click', (e) => {
            e.stopPropagation();
            // 回填数据逻辑...
            document.getElementById('wb-input-title').value = item.querySelector('.entry-title').textContent;
            document.getElementById('wb-input-keys').value = item.dataset.keys || '';
            document.getElementById('wb-input-content').value = item.dataset.content || '';
            
            const statusSelect = document.getElementById('wb-select-status');
            if (statusSelect) statusSelect.value = item.dataset.status || 'permanent';

            const strategySelect = document.getElementById('wb-select-strategy');
            if (strategySelect) {
                strategySelect.value = item.dataset.strategy || 'depth';
                strategySelect.dispatchEvent(new Event('change'));
            }

            currentEditingEntryId = data.id;
            switchPage('page-worldbook-edit');
        });

        document.getElementById('wb-entry-list').appendChild(item);
    }

    // 2. 定义“保存所有条目”的函数
    function saveAllEntries() {
        // ★ 如果没有书名，就不存（防止报错）
        if (!currentBookName) return;

        const entries = [];
        const list = document.getElementById('wb-entry-list');
        if (!list) return;

        list.querySelectorAll('.entry-item').forEach(item => {
            entries.push({
                id: item.id,
                title: item.querySelector('.entry-title').textContent,
                keys: item.dataset.keys,
                content: item.dataset.content,
                strategy: item.dataset.strategy,
                status: item.dataset.status,
                isActive: item.querySelector('.capsule-switch').classList.contains('active')
            });
        });
        
        // ★ 关键：用书名做区分！
        localStorage.setItem('wb_data_' + currentBookName, JSON.stringify(entries));
    }

    // 3. 定义“加载所有条目”的函数
    function loadAllEntries() {
        // ★ 如果没有书名，就不读
        if (!currentBookName) return;

        // ★ 关键：读取对应书名的数据
        const savedData = localStorage.getItem('wb_data_' + currentBookName);
        
        const list = document.getElementById('wb-entry-list');
        if(list) list.innerHTML = ''; // 先清空

        if (savedData) {
            const entries = JSON.parse(savedData);
            entries.forEach(data => {
                renderEntryElement(data);
            });
        }
    }

}
